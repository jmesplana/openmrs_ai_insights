import { createContext, useContext, useState, useEffect } from 'react'

const OpenMRSContext = createContext(null)

// Default settings
const DEFAULT_SETTINGS = {
  mockData: true,
  corsProxy: 'https://corsproxy.io/?',
  aiProvider: 'openai', // 'openai' or 'ollama'
  openAiApiKey: '',
  ollamaEndpoint: 'http://localhost:11434',
  ollamaModel: 'llama3',
}

export const useOpenMRS = () => {
  const context = useContext(OpenMRSContext)
  if (!context) {
    throw new Error('useOpenMRS must be used within an OpenMRSProvider')
  }
  return context
}

export const OpenMRSProvider = ({ children }) => {
  // Try to load settings from localStorage
  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('openmrsAiSettings')
      return savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS
    } catch (e) {
      console.error('Failed to load settings from localStorage:', e)
      return DEFAULT_SETTINGS
    }
  }

  const [credentials, setCredentials] = useState({
    username: 'admin',
    password: 'Admin123',
    baseUrl: 'https://o2.openmrs.org/openmrs',
  })
  
  const [settings, setSettings] = useState(loadSettings)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState(null)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [patientData, setPatientData] = useState(null)
  const [isLoadingPatientData, setIsLoadingPatientData] = useState(false)

  // Save settings to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('openmrsAiSettings', JSON.stringify(settings))
    } catch (e) {
      console.error('Failed to save settings to localStorage:', e)
    }
  }, [settings])

  const updateCredentials = (newCredentials) => {
    setCredentials({
      ...credentials,
      ...newCredentials,
    })
    setIsConnected(false)
    setConnectionError(null)
  }

  const updateSettings = (newSettings) => {
    setSettings({
      ...settings,
      ...newSettings,
    })
    // If mock data setting changes, reset connection
    if ('mockData' in newSettings && newSettings.mockData !== settings.mockData) {
      setIsConnected(false)
    }
  }

  const value = {
    credentials,
    updateCredentials,
    isConnected,
    setIsConnected,
    connectionError,
    setConnectionError,
    selectedPatient,
    setSelectedPatient,
    patientData,
    setPatientData,
    isLoadingPatientData,
    setIsLoadingPatientData,
    settings,
    updateSettings,
  }

  return (
    <OpenMRSContext.Provider value={value}>
      {children}
    </OpenMRSContext.Provider>
  )
}