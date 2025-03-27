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
  
  // For production deployment, use the actual API directly
  const api = axios.create({
    baseURL: `${baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl}`,
    headers: {
      'Content-Type': 'application/json',
    },
    auth: {
      username,
      password,
    },
  })

  return {
    // Test connection
    testConnection: async () => {
      try {
        const response = await api.get('/ws/rest/v1/session')
        return { success: response.data.authenticated }
      } catch (error) {
        console.error('Connection test failed:', error)
        throw new Error(error.response?.data?.error?.message || 'Failed to connect to OpenMRS')
      }
    },

    // Search patients
    searchPatients: async (query) => {
      try {
        const response = await api.get(`/ws/rest/v1/patient?q=${query}&v=custom:(uuid,display,identifiers,person:(gender,age,birthdate,preferredAddress))`)
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
          api.get(`/ws/rest/v1/patient/${patientUuid}?v=full`),
          api.get(`/ws/rest/v1/encounter?patient=${patientUuid}&v=full`),
          api.get(`/ws/rest/v1/obs?patient=${patientUuid}&v=full`),
          api.get(`/ws/rest/v1/condition?patient=${patientUuid}&v=full`),
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