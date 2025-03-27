import {
  Box,
  Heading,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  Flex,
  useColorModeValue
} from '@chakra-ui/react'

const PatientEncounters = ({ encounters }) => {
  if (!encounters || encounters.length === 0) {
    return (
      <Alert status="info">
        <AlertIcon />
        No encounters found for this patient
      </Alert>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  // Sort encounters by date (newest first)
  const sortedEncounters = [...encounters].sort((a, b) => 
    new Date(b.encounterDatetime) - new Date(a.encounterDatetime)
  )

  return (
    <Box>
      <Heading size="md" mb={4}>
        Patient Encounters ({sortedEncounters.length})
      </Heading>

      <Accordion allowToggle defaultIndex={[0]}>
        {sortedEncounters.map((encounter, index) => (
          <AccordionItem key={index}>
            <h2>
              <AccordionButton py={3}>
                <Box flex="1" textAlign="left">
                  <Flex justify="space-between" align="center">
                    <Text fontWeight="bold">
                      {formatDate(encounter.encounterDatetime)}
                    </Text>
                    <Badge colorScheme="blue" mr={2}>
                      {encounter.encounterType.display}
                    </Badge>
                  </Flex>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Box mb={3}>
                <Text fontWeight="semibold">Location:</Text>
                <Text>{encounter.location?.display || 'Not specified'}</Text>
              </Box>

              <Box mb={3}>
                <Text fontWeight="semibold">Provider:</Text>
                <Text>
                  {encounter.encounterProviders && encounter.encounterProviders.length > 0
                    ? encounter.encounterProviders[0].provider.display
                    : 'Not specified'}
                </Text>
              </Box>

              {encounter.obs && encounter.obs.length > 0 && (
                <Box mt={4}>
                  <Text fontWeight="semibold" mb={2}>Observations:</Text>
                  <Table size="sm" variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Observation</Th>
                        <Th>Value</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {encounter.obs.map((obs, obsIndex) => (
                        <Tr key={obsIndex}>
                          <Td>{obs.concept.display}</Td>
                          <Td>
                            {obs.value
                              ? (typeof obs.value === 'object'
                                ? obs.value.display
                                : obs.value)
                              : 'No value'}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}

              {encounter.diagnoses && encounter.diagnoses.length > 0 && (
                <Box mt={4}>
                  <Text fontWeight="semibold" mb={2}>Diagnoses:</Text>
                  <Table size="sm" variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Diagnosis</Th>
                        <Th>Certainty</Th>
                        <Th>Order</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {encounter.diagnoses.map((diagnosis, dxIndex) => (
                        <Tr key={dxIndex}>
                          <Td>{diagnosis.display || diagnosis.diagnosis.display}</Td>
                          <Td>{diagnosis.certainty}</Td>
                          <Td>{diagnosis.rank}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Box>
  )
}

export default PatientEncounters