import { Box, Flex, Heading, Text, Badge, Avatar } from '@chakra-ui/react'

const PatientHeader = ({ patient }) => {
  if (!patient) return null
  
  const gender = patient.person.gender === 'M' ? 'Male' : 
                 patient.person.gender === 'F' ? 'Female' : 
                 patient.person.gender
  
  return (
    <Flex align="center">
      <Avatar 
        size="lg" 
        name={patient.display} 
        bg={patient.person.gender === 'M' ? 'blue.300' : 'pink.300'}
        mr={4}
      />
      <Box>
        <Heading size="lg">{patient.display}</Heading>
        <Flex mt={1} align="center" gap={3}>
          <Badge colorScheme="blue">{gender}</Badge>
          <Text fontSize="sm">{patient.person.age} years</Text>
          
          {patient.identifiers?.map((id, index) => (
            <Text key={index} fontSize="sm" fontWeight="medium">
              {id.identifierType.display}: <span style={{ fontWeight: 'normal' }}>{id.identifier}</span>
            </Text>
          ))}
        </Flex>
      </Box>
    </Flex>
  )
}

export default PatientHeader