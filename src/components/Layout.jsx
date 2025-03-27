import { Grid, GridItem } from '@chakra-ui/react'
import Sidebar from './Sidebar'
import MainContent from './MainContent'
import { useOpenMRS } from '../contexts/OpenMRSContext'

const Layout = () => {
  const { selectedPatient, isLoadingPatientData } = useOpenMRS()

  return (
    <Grid
      templateColumns={['1fr', '1fr', '350px 1fr']}
      gap={0}
      h="100vh"
      overflow="hidden"
    >
      <GridItem
        borderRight="1px"
        borderColor="gray.200"
        bg="white"
        overflowY="auto"
        h="100vh"
      >
        <Sidebar />
      </GridItem>
      
      <GridItem overflowY="auto" h="100vh">
        <MainContent />
      </GridItem>
    </Grid>
  )
}

export default Layout