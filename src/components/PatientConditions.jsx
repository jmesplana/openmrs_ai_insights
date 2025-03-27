import {
  Box,
  Heading,
  Text,
  Alert,
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon
} from '@chakra-ui/react'

const PatientConditions = ({ conditions }) => {
  if (!conditions || conditions.length === 0) {
    return (
      <Alert status="info">
        <AlertIcon />
        No conditions found for this patient
      </Alert>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleDateString()
  }

  // Sort conditions by onset date (newest first)
  const sortedConditions = [...conditions].sort((a, b) => {
    if (!a.onsetDate) return 1
    if (!b.onsetDate) return -1
    return new Date(b.onsetDate) - new Date(a.onsetDate)
  })

  const getStatusColor = (status) => {
    if (!status) return 'gray'
    const statusLower = status.toLowerCase()
    if (statusLower.includes('active')) return 'red'
    if (statusLower.includes('resolved') || statusLower.includes('inactive')) return 'green'
    if (statusLower.includes('remission')) return 'yellow'
    return 'blue'
  }

  return (
    <Box>
      <Heading size="md" mb={4}>
        Patient Conditions ({sortedConditions.length})
      </Heading>

      <Accordion allowToggle defaultIndex={[0]}>
        {sortedConditions.map((condition, index) => (
          <AccordionItem key={index}>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Text fontWeight="bold">{condition.condition.display}</Text>
                </Box>
                <Badge colorScheme={getStatusColor(condition.clinicalStatus?.display)}>
                  {condition.clinicalStatus?.display || 'Unknown status'}
                </Badge>
                <AccordionIcon ml={2} />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Table size="sm" variant="simple">
                <Tbody>
                  <Tr>
                    <Th width="150px">Onset Date</Th>
                    <Td>{formatDate(condition.onsetDate)}</Td>
                  </Tr>
                  {condition.endDate && (
                    <Tr>
                      <Th>End Date</Th>
                      <Td>{formatDate(condition.endDate)}</Td>
                    </Tr>
                  )}
                  <Tr>
                    <Th>Clinical Status</Th>
                    <Td>{condition.clinicalStatus?.display || 'Not specified'}</Td>
                  </Tr>
                  <Tr>
                    <Th>Verification</Th>
                    <Td>{condition.verificationStatus?.display || 'Not specified'}</Td>
                  </Tr>
                  {condition.additionalDetail && (
                    <Tr>
                      <Th>Additional Notes</Th>
                      <Td>{condition.additionalDetail}</Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Box>
  )
}

export default PatientConditions