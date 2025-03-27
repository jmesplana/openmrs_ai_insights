import { Box } from '@chakra-ui/react'
import { OpenMRSProvider } from './contexts/OpenMRSContext'
import Layout from './components/Layout'

function App() {
  return (
    <OpenMRSProvider>
      <Box minH="100vh" bg="gray.50">
        <Layout />
      </Box>
    </OpenMRSProvider>
  )
}

export default App