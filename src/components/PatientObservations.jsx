import { useState, useMemo } from 'react'
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  InputGroup,
  InputLeftElement,
  Alert,
  AlertIcon,
  Select,
  Stack,
  Tag,
  TagLabel,
  Flex
} from '@chakra-ui/react'
import { FaSearch, FaFilter } from 'react-icons/fa'

const PatientObservations = ({ observations }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [conceptFilter, setConceptFilter] = useState('')

  if (!observations || observations.length === 0) {
    return (
      <Alert status="info">
        <AlertIcon />
        No observations found for this patient
      </Alert>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  // Extract unique concepts for filtering
  const uniqueConcepts = useMemo(() => {
    const concepts = new Set()
    observations.forEach(obs => {
      if (obs.concept && obs.concept.display) {
        concepts.add(obs.concept.display)
      }
    })
    return Array.from(concepts).sort()
  }, [observations])

  // Sort observations by date (newest first) and filter by search term and concept
  const filteredObservations = useMemo(() => {
    return [...observations]
      .filter(obs => {
        const matchesConcept = !conceptFilter || 
          (obs.concept && obs.concept.display === conceptFilter)

        const matchesSearch = !searchTerm || 
          (obs.concept && obs.concept.display.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (obs.value && typeof obs.value === 'object' && obs.value.display && 
           obs.value.display.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (obs.value && typeof obs.value === 'string' && 
           obs.value.toLowerCase().includes(searchTerm.toLowerCase()))

        return matchesConcept && matchesSearch
      })
      .sort((a, b) => new Date(b.obsDatetime) - new Date(a.obsDatetime))
  }, [observations, searchTerm, conceptFilter])

  return (
    <Box>
      <Heading size="md" mb={4}>
        Patient Observations ({observations.length})
      </Heading>

      <Stack direction={['column', 'row']} spacing={4} mb={4}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <FaSearch color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search observations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        <Select 
          placeholder="Filter by concept"
          value={conceptFilter}
          onChange={(e) => setConceptFilter(e.target.value)}
          icon={<FaFilter />}
        >
          <option value="">All concepts</option>
          {uniqueConcepts.map((concept) => (
            <option key={concept} value={concept}>
              {concept}
            </option>
          ))}
        </Select>
      </Stack>

      {filteredObservations.length === 0 ? (
        <Alert status="info">
          <AlertIcon />
          No observations match your filters
        </Alert>
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Date</Th>
              <Th>Concept</Th>
              <Th>Value</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredObservations.map((obs, index) => (
              <Tr key={index}>
                <Td>{formatDate(obs.obsDatetime)}</Td>
                <Td>
                  <Flex direction="column">
                    <Text>{obs.concept.display}</Text>
                    {obs.concept.units && (
                      <Text fontSize="xs" color="gray.500">
                        Units: {obs.concept.units}
                      </Text>
                    )}
                  </Flex>
                </Td>
                <Td>
                  {obs.value
                    ? (typeof obs.value === 'object'
                      ? obs.value.display || JSON.stringify(obs.value)
                      : obs.value)
                    : 'No value'}
                </Td>
                <Td>
                  {obs.status && (
                    <Tag size="sm" colorScheme={obs.status === 'FINAL' ? 'green' : 'orange'}>
                      <TagLabel>{obs.status}</TagLabel>
                    </Tag>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  )
}

export default PatientObservations