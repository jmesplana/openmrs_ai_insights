import { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  InputGroup,
  InputRightElement,
  Divider,
  useToast,
  List,
  ListItem,
  Avatar,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tag,
  IconButton,
  useDisclosure,
} from '@chakra-ui/react'
import { FaEye, FaEyeSlash, FaSearch, FaCog } from 'react-icons/fa'
import { useOpenMRS } from '../contexts/OpenMRSContext'
import createOpenMrsApi from '../services/openMrsService'
import { useQuery } from 'react-query'
import debounce from 'lodash.debounce'
import SettingsModal from './SettingsModal'

const Sidebar = () => {
  const toast = useToast()
  const {
    credentials,
    updateCredentials,
    isConnected,
    setIsConnected,
    setConnectionError,
    setSelectedPatient,
    setPatientData,
    setIsLoadingPatientData,
    settings,
  } = useOpenMRS()

  const [showPassword, setShowPassword] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [localCredentials, setLocalCredentials] = useState(credentials)
  const [showProxyMessage, setShowProxyMessage] = useState(false)
  
  // Settings modal
  const { isOpen, onOpen, onClose } = useDisclosure()
  
  // Detect if we're in local development
  const isLocalDevelopment = window.location.hostname === 'localhost' || 
                            window.location.hostname === '127.0.0.1'

  // Patient search query
  const {
    data: searchResults,
    isLoading: isSearching,
    error: searchError,
    refetch: refetchSearch,
  } = useQuery(
    ['patientSearch', searchQuery],
    async () => {
      if (!searchQuery || searchQuery.length < 3 || !isConnected) return []
      const api = createOpenMrsApi(credentials, settings)
      return await api.searchPatients(searchQuery)
    },
    {
      enabled: isConnected && searchQuery.length >= 3,
      keepPreviousData: true,
    }
  )

  const handleCredentialChange = (e) => {
    const { name, value } = e.target
    setLocalCredentials((prev) => ({ ...prev, [name]: value }))
  }

  const testConnection = async () => {
    setIsConnecting(true)
    setShowProxyMessage(false)
    try {
      updateCredentials(localCredentials)
      const api = createOpenMrsApi(localCredentials, settings)
      const result = await api.testConnection()
      
      if (result.success) {
        setIsConnected(true)
        toast({
          title: 'Connected successfully',
          status: 'success',
          duration: 3000,
        })
      }
    } catch (error) {
      setConnectionError(error.message)
      
      // Check if this is a proxy server error
      if (error.message.includes('proxy') || error.message.includes('Network Error')) {
        setShowProxyMessage(true)
      }
      
      toast({
        title: 'Connection failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const debouncedSearch = debounce((value) => {
    setSearchQuery(value)
  }, 500)

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value)
  }

  const selectPatient = async (patient) => {
    setSelectedPatient(patient)
    setIsLoadingPatientData(true)
    setPatientData(null)
    
    try {
      const api = createOpenMrsApi(credentials, settings)
      const data = await api.getPatientData(patient.uuid)
      setPatientData(data)
    } catch (error) {
      toast({
        title: 'Failed to load patient data',
        description: error.message,
        status: 'error',
        duration: 5000,
      })
    } finally {
      setIsLoadingPatientData(false)
    }
  }

  return (
    <Box p={4}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Flex align="center" justify="space-between" mb={4}>
            <Heading size="md">
              OpenMRS Connection
              {settings.mockData && isLocalDevelopment ? (
                <Tag size="sm" colorScheme="green" ml={2}>
                  Mock Data
                </Tag>
              ) : isLocalDevelopment ? (
                <Tag size="sm" colorScheme="blue" ml={2}>
                  Local Proxy
                </Tag>
              ) : null}
            </Heading>
            
            <IconButton
              aria-label="Settings"
              icon={<FaCog />}
              size="sm"
              onClick={onOpen}
              variant="ghost"
            />
          </Flex>
          
          <VStack spacing={3} align="stretch">
            <FormControl>
              <FormLabel>Base URL</FormLabel>
              <Input
                name="baseUrl"
                value={localCredentials.baseUrl}
                onChange={handleCredentialChange}
                placeholder="https://demo.openmrs.org/openmrs"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Username</FormLabel>
              <Input
                name="username"
                value={localCredentials.username}
                onChange={handleCredentialChange}
                placeholder="admin"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={localCredentials.password}
                  onChange={handleCredentialChange}
                  placeholder="Password"
                />
                <InputRightElement width="3rem">
                  <Button
                    h="1.5rem"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>
            
            {showProxyMessage && !settings.mockData && (
              <Alert status="warning" mb={3}>
                <AlertIcon />
                <Box>
                  <AlertTitle>Local Proxy Server Required</AlertTitle>
                  <AlertDescription>
                    <Text mb={2}>
                      Please start the proxy server in a separate terminal:
                    </Text>
                    <Text as="pre" p={2} bg="gray.50" borderRadius="md" fontSize="sm">
                      npm run proxy
                    </Text>
                  </AlertDescription>
                </Box>
              </Alert>
            )}
            
            <Button
              colorScheme="blue"
              onClick={testConnection}
              isLoading={isConnecting}
              loadingText="Connecting"
            >
              {isConnected ? 'Reconnect' : 'Connect'}
            </Button>
            
            {isConnected && (
              <Text color="green.500" fontSize="sm">
                Connected successfully
                {settings.mockData && isLocalDevelopment && ' (using mock data)'}
                {!settings.mockData && isLocalDevelopment && ' (using local proxy)'}
              </Text>
            )}
          </VStack>
        </Box>

        {isConnected && (
          <>
            <Divider />
            
            <Box>
              <Heading size="md" mb={4}>
                Patient Search
              </Heading>
              <InputGroup mb={4}>
                <Input
                  placeholder="Search patients..."
                  onChange={handleSearchChange}
                  disabled={!isConnected}
                />
                <InputRightElement>
                  {isSearching ? <Spinner size="sm" /> : <FaSearch />}
                </InputRightElement>
              </InputGroup>
              
              {searchError && (
                <Text color="red.500" fontSize="sm" mb={2}>
                  {searchError.message}
                </Text>
              )}
              
              {searchResults && searchResults.length > 0 ? (
                <List spacing={2}>
                  {searchResults.map((patient) => (
                    <ListItem 
                      key={patient.uuid}
                      onClick={() => selectPatient(patient)}
                      p={2}
                      borderRadius="md"
                      cursor="pointer"
                      _hover={{ bg: 'blue.50' }}
                    >
                      <Flex align="center">
                        <Avatar 
                          size="sm" 
                          name={patient.display}
                          bg={patient.person.gender === 'M' ? 'blue.300' : 'pink.300'}
                          mr={2} 
                        />
                        <Box>
                          <Text fontWeight="medium">{patient.display}</Text>
                          <Text fontSize="xs">
                            {patient.person.gender}, {patient.person.age} years
                          </Text>
                        </Box>
                      </Flex>
                    </ListItem>
                  ))}
                </List>
              ) : searchQuery.length >= 3 && !isSearching && (
                <Text color="gray.500">No patients found</Text>
              )}
              
              {settings.mockData && isLocalDevelopment && !searchQuery && (
                <Text fontSize="sm" color="gray.500" mt={2}>
                  Try searching for "Smith" or "Johnson" to see mock patients.
                </Text>
              )}
            </Box>
          </>
        )}
      </VStack>

      {/* Settings Modal */}
      <SettingsModal isOpen={isOpen} onClose={onClose} />
    </Box>
  )
}

export default Sidebar