import { useEffect, useState } from 'react'
import {
  Box,
  Text,
  Heading,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Divider,
  Spinner,
  Center,
  VStack,
  Image,
  Flex,
  useDisclosure,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Button,
  IconButton,
} from '@chakra-ui/react'
import { FaUser, FaNotesMedical, FaCalendarAlt, FaThermometerHalf } from 'react-icons/fa'
import { useOpenMRS } from '../contexts/OpenMRSContext'
import PatientHeader from './PatientHeader'
import PatientDemographics from './PatientDemographics'
import PatientEncounters from './PatientEncounters'
import PatientObservations from './PatientObservations'
import PatientConditions from './PatientConditions'
import AiChatPanel from './AiChatPanel'

const MainContent = () => {
  const { selectedPatient, patientData, isLoadingPatientData, isConnected } = useOpenMRS()
  const [tabIndex, setTabIndex] = useState(0)
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true })

  // If no patient is selected
  if (!isConnected) {
    return (
      <Center h="100vh" bg="gray.50">
        <VStack spacing={6}>
          <Image 
            src="https://openmrs.org/wp-content/uploads/2017/07/openmrs-logo-300.png" 
            alt="OpenMRS Logo" 
            maxW="200px" 
          />
          <Heading size="lg" color="gray.600">OpenMRS AI Assistant</Heading>
          <Text color="gray.500">Connect to an OpenMRS server to get started</Text>
        </VStack>
      </Center>
    )
  }

  if (!selectedPatient) {
    return (
      <Center h="100vh" bg="gray.50">
        <VStack spacing={6}>
          <FaUser size="4em" color="#718096" />
          <Heading size="lg" color="gray.600">No Patient Selected</Heading>
          <Text color="gray.500">Search and select a patient from the sidebar</Text>
        </VStack>
      </Center>
    )
  }

  if (isLoadingPatientData) {
    return (
      <Center h="100vh" bg="gray.50">
        <VStack spacing={6}>
          <Spinner size="xl" color="blue.500" />
          <Text color="gray.600">Loading patient data...</Text>
        </VStack>
      </Center>
    )
  }

  return (
    <Box>
      {patientData && (
        <Flex direction="column" h="100vh">
          <Box px={6} py={4} bg="white" boxShadow="sm">
            <PatientHeader patient={patientData.demographics} />
          </Box>
          
          <Divider />
          
          <Flex flex="1" overflow="hidden">
            <Box 
              flex="1" 
              overflowY="auto" 
              p={4}
            >
              <Tabs 
                variant="enclosed" 
                colorScheme="blue" 
                index={tabIndex} 
                onChange={setTabIndex}
                isLazy
              >
                <TabList>
                  <Tab><FaUser style={{ marginRight: '8px' }} />Demographics</Tab>
                  <Tab><FaCalendarAlt style={{ marginRight: '8px' }} />Encounters</Tab>
                  <Tab><FaThermometerHalf style={{ marginRight: '8px' }} />Observations</Tab>
                  <Tab><FaNotesMedical style={{ marginRight: '8px' }} />Conditions</Tab>
                </TabList>
                
                <TabPanels>
                  <TabPanel>
                    <PatientDemographics patient={patientData.demographics} />
                  </TabPanel>
                  
                  <TabPanel>
                    <PatientEncounters encounters={patientData.encounters} />
                  </TabPanel>
                  
                  <TabPanel>
                    <PatientObservations observations={patientData.observations} />
                  </TabPanel>
                  
                  <TabPanel>
                    <PatientConditions conditions={patientData.conditions} />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
            
            <Box 
              w="350px" 
              bg="gray.50" 
              borderLeft="1px" 
              borderColor="gray.200"
              display={["none", "none", "block"]}
            >
              <AiChatPanel patientData={patientData} />
            </Box>
          </Flex>
        </Flex>
      )}
    </Box>
  )
}

export default MainContent