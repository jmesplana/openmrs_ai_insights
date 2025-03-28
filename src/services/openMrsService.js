import axios from 'axios'
import { mockPatients, mockPatientData } from './mockData'

const createOpenMrsApi = (credentials, settings) => {
  const { username, password, baseUrl } = credentials
  const { mockData } = settings
  
  // Check if we're in local development
  const isLocalDevelopment = window.location.hostname === 'localhost' || 
                            window.location.hostname === '127.0.0.1'
  
  // Use mock data for completely offline development
  if (isLocalDevelopment && mockData) {
    return {
      // Test connection
      testConnection: async () => {
        return { success: true }
      },

      // Search patients
      searchPatients: async (query) => {
        // Simple filtering for the mock data
        return mockPatients.filter(patient => 
          patient.display.toLowerCase().includes(query.toLowerCase())
        )
      },

      // Get patient details
      getPatientData: async (patientUuid) => {
        // Return mock data for the requested patient
        return mockPatientData[patientUuid]
      },
    }
  } else if (isLocalDevelopment) {
    // Use local proxy server for direct connection without CORS issues
    const LOCAL_PROXY_URL = 'http://localhost:3001/api'

    // Create axios instance for local proxy
    const api = axios.create({
      baseURL: LOCAL_PROXY_URL,
      auth: {
        username,
        password,
      }
    })

    // Helper to build proxy URL with query parameters
    const buildProxyUrl = (path) => {
      return `?baseUrl=${encodeURIComponent(baseUrl)}&path=${encodeURIComponent(path)}`
    }
    
    return {
      // Test connection
      testConnection: async () => {
        try {
          const response = await api.get(buildProxyUrl('/ws/rest/v1/session'))
          return { success: response.data.authenticated }
        } catch (error) {
          console.error('Connection test failed:', error)
          if (error.message.includes('Network Error')) {
            throw new Error('Local proxy server not running. Please start it with "npm run proxy" in a separate terminal.')
          }
          throw new Error(error.response?.data?.message || 'Failed to connect to OpenMRS')
        }
      },

      // Search patients
      searchPatients: async (query) => {
        try {
          const response = await api.get(
            buildProxyUrl(`/ws/rest/v1/patient?q=${query}&v=custom:(uuid,display,identifiers,person:(gender,age,birthdate,preferredAddress))`)
          )
          return response.data.results
        } catch (error) {
          console.error('Patient search failed:', error)
          throw new Error(error.response?.data?.message || 'Failed to search patients')
        }
      },

      // Get patient details
      getPatientData: async (patientUuid) => {
        try {
          // Execute all requests in sequence for reliability
          const patientResponse = await api.get(buildProxyUrl(`/ws/rest/v1/patient/${patientUuid}?v=full`))
          const encountersResponse = await api.get(buildProxyUrl(`/ws/rest/v1/encounter?patient=${patientUuid}&v=full`))
          const observationsResponse = await api.get(buildProxyUrl(`/ws/rest/v1/obs?patient=${patientUuid}&v=full`))
          const conditionsResponse = await api.get(buildProxyUrl(`/ws/rest/v1/condition?patient=${patientUuid}&v=full`))

          return {
            demographics: patientResponse.data,
            encounters: encountersResponse.data.results,
            observations: observationsResponse.data.results,
            conditions: conditionsResponse.data.results,
          }
        } catch (error) {
          console.error('Failed to get patient data:', error)
          throw new Error(error.response?.data?.message || 'Failed to retrieve patient data')
        }
      },
    }
  }
  
  // For production deployment, determine if we need to use the Vercel API route
  const isVercelProduction = typeof window !== 'undefined' && 
    window.location.hostname.includes('vercel.app')

  // Create axios instance with appropriate configuration
  const api = axios.create({
    // Don't set a baseURL as we'll use the full path in each request
    headers: {
      'Content-Type': 'application/json',
    },
    auth: {
      username,
      password,
    },
  })
  
  // Helper to build proxy URL
  const buildProxyUrl = (path) => {
    // Always use the query parameter format which is more reliable
    // For Vercel deployments, also pass credentials in query string (more reliable)
    const isVercelDeployment = typeof window !== 'undefined' && 
      window.location.hostname.includes('vercel.app');
      
    if (isVercelDeployment) {
      return `/api?baseUrl=${encodeURIComponent(baseUrl)}&path=${encodeURIComponent(path)}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    } else {
      return `/api?baseUrl=${encodeURIComponent(baseUrl)}&path=${encodeURIComponent(path)}`;
    }
  }

  return {
    // Test connection
    testConnection: async () => {
      try {
        console.log('Testing connection to OpenMRS at:', baseUrl);
        const fullUrl = buildProxyUrl('/ws/rest/v1/session');
        console.log('Using full URL:', fullUrl);
        
        const response = await api.get(fullUrl);
        console.log('Connection test response:', response.data);
        
        if (response.data && response.data.authenticated === true) {
          return { success: true };
        } else {
          console.warn('Authentication response not as expected:', response.data);
          return { 
            success: false, 
            message: 'Connected to server but authentication failed. Please check credentials.' 
          };
        }
      } catch (error) {
        console.error('Connection test failed:', error);
        
        // Detailed error diagnosis
        let errorMessage = 'Failed to connect to OpenMRS';
        
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Response error status:', error.response.status);
          console.error('Response error data:', error.response.data);
          
          if (error.response.status === 401) {
            errorMessage = 'Authentication failed. Please check your username and password.';
          } else if (error.response.status === 404) {
            errorMessage = 'OpenMRS API not found at the specified URL. Please check your server URL.';
          } else if (error.response.data?.error?.message) {
            errorMessage = error.response.data.error.message;
          } else if (error.response.data?.message) {
            errorMessage = error.response.data.message;
          }
        } else if (error.request) {
          // The request was made but no response was received
          console.error('No response received:', error.request);
          errorMessage = 'No response from server. Please check the server URL and ensure it is accessible.';
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Request setup error:', error.message);
          errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
      }
    },

    // Search patients
    searchPatients: async (query) => {
      try {
        const response = await api.get(
          buildProxyUrl(`/ws/rest/v1/patient?q=${query}&v=custom:(uuid,display,identifiers,person:(gender,age,birthdate,preferredAddress))`)
        )
        return response.data.results
      } catch (error) {
        console.error('Patient search failed:', error)
        throw new Error(error.response?.data?.error?.message || 'Failed to search patients')
      }
    },

    // Get patient details
    getPatientData: async (patientUuid) => {
      try {
        // Execute all requests in parallel
        const [patientDetails, encounters, observations, conditions] = await Promise.all([
          api.get(buildProxyUrl(`/ws/rest/v1/patient/${patientUuid}?v=full`)),
          api.get(buildProxyUrl(`/ws/rest/v1/encounter?patient=${patientUuid}&v=full`)),
          api.get(buildProxyUrl(`/ws/rest/v1/obs?patient=${patientUuid}&v=full`)),
          api.get(buildProxyUrl(`/ws/rest/v1/condition?patient=${patientUuid}&v=full`)),
        ])

        return {
          demographics: patientDetails.data,
          encounters: encounters.data.results,
          observations: observations.data.results,
          conditions: conditions.data.results,
        }
      } catch (error) {
        console.error('Failed to get patient data:', error)
        throw new Error(error.response?.data?.error?.message || 'Failed to retrieve patient data')
      }
    },
  }
}

export default createOpenMrsApi