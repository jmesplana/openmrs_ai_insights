import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Divider,
  List,
  ListItem
} from '@chakra-ui/react'

const PatientDemographics = ({ patient }) => {
  if (!patient) return null

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
        <Card>
          <CardHeader>
            <Heading size="md">Personal Information</Heading>
          </CardHeader>
          <Divider />
          <CardBody>
            <SimpleGrid columns={2} spacing={2}>
              <Text fontWeight="bold">Full Name:</Text>
              <Text>{patient.person.display}</Text>
              
              <Text fontWeight="bold">Gender:</Text>
              <Text>
                {patient.person.gender === 'M' ? 'Male' : 
                 patient.person.gender === 'F' ? 'Female' : 
                 patient.person.gender}
              </Text>
              
              <Text fontWeight="bold">Birth Date:</Text>
              <Text>{formatDate(patient.person.birthdate)}</Text>
              
              <Text fontWeight="bold">Age:</Text>
              <Text>{patient.person.age} years</Text>
            </SimpleGrid>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">Contact Information</Heading>
          </CardHeader>
          <Divider />
          <CardBody>
            {patient.person.addresses && patient.person.addresses.length > 0 ? (
              <>
                <Text fontWeight="bold" mb={2}>Address:</Text>
                {patient.person.addresses.map((address, index) => (
                  <Box key={index} mb={3}>
                    <Text>
                      {[address.address1, address.address2, address.cityVillage]
                        .filter(Boolean)
                        .join(", ")}
                    </Text>
                    <Text>
                      {[address.stateProvince, address.postalCode, address.country]
                        .filter(Boolean)
                        .join(", ")}
                    </Text>
                  </Box>
                ))}
              </>
            ) : (
              <Text>No address information available</Text>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">Identifiers</Heading>
          </CardHeader>
          <Divider />
          <CardBody>
            {patient.identifiers && patient.identifiers.length > 0 ? (
              <List spacing={2}>
                {patient.identifiers.map((id, index) => (
                  <ListItem key={index}>
                    <Text fontWeight="bold">{id.identifierType.display}:</Text>
                    <Text>{id.identifier}</Text>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Text>No identifiers available</Text>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  )
}

export default PatientDemographics