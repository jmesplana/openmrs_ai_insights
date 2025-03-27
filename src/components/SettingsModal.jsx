import { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Switch,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  HStack,
  Radio,
  RadioGroup,
  Select,
  Spinner,
} from '@chakra-ui/react'
import { FaEye, FaEyeSlash, FaSync } from 'react-icons/fa'
import { useOpenMRS } from '../contexts/OpenMRSContext'
import { fetchOllamaModels, testOllamaConnection } from '../services/aiService'

const SettingsModal = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useOpenMRS()
  const [localSettings, setLocalSettings] = useState({ ...settings })
  const [showApiKey, setShowApiKey] = useState(false)
  const [ollamaModels, setOllamaModels] = useState([])
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const [ollamaConnectionStatus, setOllamaConnectionStatus] = useState(null)
  const [isTesting, setIsTesting] = useState(false)
  const toast = useToast()

  // Update local settings when settings change
  useEffect(() => {
    setLocalSettings({ ...settings })
  }, [settings, isOpen])
  
  // Load Ollama models when the endpoint changes or modal opens
  useEffect(() => {
    if (isOpen && localSettings.aiProvider === 'ollama') {
      loadOllamaModels();
    }
  }, [isOpen, localSettings.ollamaEndpoint])

  const handleSave = () => {
    updateSettings(localSettings)
    toast({
      title: 'Settings saved',
      status: 'success',
      duration: 2000,
    })
    onClose()
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setLocalSettings({
      ...localSettings,
      [name]: type === 'checkbox' ? checked : value,
    })
  }
  
  const handleRadioChange = (name, value) => {
    setLocalSettings({
      ...localSettings,
      [name]: value,
    })
  }
  
  // Load Ollama models
  const loadOllamaModels = async () => {
    if (!localSettings.ollamaEndpoint) return;
    
    setIsLoadingModels(true);
    try {
      const models = await fetchOllamaModels(localSettings.ollamaEndpoint);
      setOllamaModels(models);
      
      // If no model is selected or the selected model isn't available, select the first one
      if (!localSettings.ollamaModel || !models.find(m => m.name === localSettings.ollamaModel)) {
        if (models.length > 0) {
          setLocalSettings({
            ...localSettings,
            ollamaModel: models[0].name
          });
        }
      }
    } catch (error) {
      console.error('Failed to load Ollama models:', error);
      toast({
        title: 'Failed to load models',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
      setOllamaModels([]);
    } finally {
      setIsLoadingModels(false);
    }
  };
  
  // Test Ollama connection
  const testConnection = async () => {
    if (!localSettings.ollamaEndpoint) return;
    
    setIsTesting(true);
    try {
      const result = await testOllamaConnection(localSettings.ollamaEndpoint);
      setOllamaConnectionStatus(result);
      
      if (result.success) {
        toast({
          title: 'Connection successful',
          description: `Connected to Ollama v${result.version}`,
          status: 'success',
          duration: 3000,
        });
        
        // Load models if connection is successful
        loadOllamaModels();
      } else {
        toast({
          title: 'Connection failed',
          description: result.error,
          status: 'error',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Connection test error:', error);
      setOllamaConnectionStatus({
        success: false,
        error: error.message
      });
      toast({
        title: 'Connection test error',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const isLocalDevelopment = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1'

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Application Settings</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Tabs>
            <TabList>
              <Tab>Data</Tab>
              <Tab>AI</Tab>
            </TabList>

            <TabPanels>
              {/* Data tab */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="mockData" mb="0">
                      Use mock data
                    </FormLabel>
                    <Switch
                      id="mockData"
                      name="mockData"
                      isChecked={localSettings.mockData}
                      onChange={handleChange}
                      colorScheme="green"
                    />
                  </FormControl>
                  
                  <Text fontSize="sm" color="gray.600">
                    {localSettings.mockData
                      ? 'Using simulated patient data for testing. No real API calls will be made.'
                      : 'Connecting to real OpenMRS API through local proxy server.'}
                  </Text>
                  
                  {!localSettings.mockData && isLocalDevelopment && (
                    <Alert status="info" mt={2}>
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Local Proxy Required</AlertTitle>
                        <AlertDescription>
                          To connect to the real OpenMRS API, you need to run the proxy server in a separate terminal:
                          <Text as="pre" mt={2} p={2} bg="gray.50" borderRadius="md" fontSize="sm">
                            npm run proxy
                          </Text>
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}
                </VStack>
              </TabPanel>
              
              {/* AI tab */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>AI Provider</FormLabel>
                    <RadioGroup 
                      onChange={(value) => handleRadioChange('aiProvider', value)} 
                      value={localSettings.aiProvider}
                    >
                      <HStack spacing={4}>
                        <Radio value="openai">OpenAI</Radio>
                        <Radio value="ollama">Ollama (Local)</Radio>
                      </HStack>
                    </RadioGroup>
                  </FormControl>
                  
                  {localSettings.aiProvider === 'openai' ? (
                    <>
                      <FormControl>
                        <FormLabel>OpenAI API Key</FormLabel>
                        <InputGroup>
                          <Input
                            name="openAiApiKey"
                            type={showApiKey ? 'text' : 'password'}
                            value={localSettings.openAiApiKey || ''}
                            onChange={handleChange}
                            placeholder="Enter your OpenAI API key"
                          />
                          <InputRightElement>
                            <IconButton
                              size="sm"
                              aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
                              icon={showApiKey ? <FaEyeSlash /> : <FaEye />}
                              onClick={() => setShowApiKey(!showApiKey)}
                              variant="ghost"
                            />
                          </InputRightElement>
                        </InputGroup>
                      </FormControl>
                      
                      <Text fontSize="sm" color="gray.600">
                        Your API key is stored locally in your browser and is never sent to our servers.
                        {!localSettings.openAiApiKey && ' Without an API key, you can still use the mock AI in local development.'}
                      </Text>
                    </>
                  ) : (
                    <>
                      <FormControl>
                        <FormLabel>Ollama Endpoint</FormLabel>
                        <InputGroup>
                          <Input
                            name="ollamaEndpoint"
                            value={localSettings.ollamaEndpoint || ''}
                            onChange={handleChange}
                            placeholder="Enter Ollama endpoint (e.g., http://localhost:11434)"
                          />
                          <InputRightElement>
                            <IconButton
                              size="sm"
                              aria-label="Test connection"
                              icon={isTesting ? <Spinner size="sm" /> : <FaSync />}
                              onClick={testConnection}
                              variant="ghost"
                              isDisabled={isTesting || !localSettings.ollamaEndpoint}
                              title="Test connection"
                            />
                          </InputRightElement>
                        </InputGroup>
                      </FormControl>
                      
                      {ollamaConnectionStatus && (
                        <Alert 
                          status={ollamaConnectionStatus.success ? "success" : "error"}
                          variant="subtle"
                          borderRadius="md"
                        >
                          <AlertIcon />
                          {ollamaConnectionStatus.success 
                            ? `Connected to Ollama v${ollamaConnectionStatus.version}`
                            : `Connection failed: ${ollamaConnectionStatus.error}`
                          }
                        </Alert>
                      )}
                      
                      <FormControl>
                        <FormLabel>Ollama Model</FormLabel>
                        <HStack>
                          <Select
                            name="ollamaModel"
                            value={localSettings.ollamaModel || ''}
                            onChange={handleChange}
                            placeholder="Select model"
                            isDisabled={isLoadingModels || ollamaModels.length === 0}
                          >
                            {ollamaModels.map((model) => (
                              <option key={model.name} value={model.name}>
                                {model.name}
                              </option>
                            ))}
                          </Select>
                          <IconButton
                            aria-label="Refresh models"
                            icon={isLoadingModels ? <Spinner size="sm" /> : <FaSync />}
                            onClick={loadOllamaModels}
                            isDisabled={isLoadingModels || !localSettings.ollamaEndpoint}
                            title="Refresh models"
                          />
                        </HStack>
                      </FormControl>
                      
                      <Text fontSize="sm" color="gray.600">
                        Use Ollama to run AI models locally on your computer without sending data to external services.
                        Make sure Ollama is running and accessible at the endpoint URL.
                      </Text>
                      
                      {ollamaModels.length === 0 && !isLoadingModels && (
                        <Alert status="info" variant="subtle" borderRadius="md">
                          <AlertIcon />
                          <Box>
                            <AlertTitle>No models found</AlertTitle>
                            <AlertDescription>
                              Make sure Ollama is running and test the connection. 
                              You may need to pull models using the Ollama CLI:
                              <Text as="pre" mt={2} p={2} bg="gray.50" borderRadius="md" fontSize="sm">
                                ollama pull llama3
                              </Text>
                            </AlertDescription>
                          </Box>
                        </Alert>
                      )}
                    </>
                  )}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSave}>
            Save Settings
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default SettingsModal