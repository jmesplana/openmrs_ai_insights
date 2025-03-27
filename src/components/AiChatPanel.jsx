import { useState, useRef, useEffect } from 'react'
import {
  Box,
  VStack,
  Heading,
  Input,
  Button,
  Text,
  Divider,
  Flex,
  Spinner,
  useToast,
  Textarea,
  InputGroup,
  InputRightElement,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Switch,
  FormControl,
  FormLabel,
  Tag,
  IconButton,
  useDisclosure,
} from '@chakra-ui/react'
import { FaPaperPlane, FaKey, FaCog, FaExpandAlt, FaCompressAlt } from 'react-icons/fa'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import { askAboutPatient, initializeAI } from '../services/aiService'
import { useOpenMRS } from '../contexts/OpenMRSContext'
import SettingsModal from './SettingsModal'

// Mock AI function for local development
const getMockAIResponse = (question, patientData) => {
  const patientName = patientData.demographics.person.display;
  const gender = patientData.demographics.person.gender === 'M' ? 'male' : 'female';
  const age = patientData.demographics.person.age;
  
  // Simple pattern matching for common questions
  if (question.toLowerCase().includes('name')) {
    return `The patient's name is ${patientName}.`;
  } 
  else if (question.toLowerCase().includes('age')) {
    return `${patientName} is ${age} years old.`;
  }
  else if (question.toLowerCase().includes('gender')) {
    return `${patientName} is a ${gender} patient.`;
  }
  else if (question.toLowerCase().includes('condition') || question.toLowerCase().includes('diagnosis')) {
    if (patientData.conditions.length > 0) {
      const conditions = patientData.conditions.map(c => c.condition.display).join(", ");
      return `${patientName} has the following conditions: ${conditions}.`;
    } else {
      return `No conditions are recorded for ${patientName}.`;
    }
  }
  else if (question.toLowerCase().includes('blood pressure')) {
    const bpObs = patientData.observations.find(o => 
      o.concept.display.toLowerCase().includes('blood pressure')
    );
    
    if (bpObs) {
      return `${patientName}'s most recent blood pressure was ${bpObs.value} ${bpObs.concept.units || ''} recorded on ${new Date(bpObs.obsDatetime).toLocaleDateString()}.`;
    } else {
      return `No blood pressure readings found for ${patientName}.`;
    }
  }
  else if (question.toLowerCase().includes('weight')) {
    const weightObs = patientData.observations.find(o => 
      o.concept.display.toLowerCase().includes('weight')
    );
    
    if (weightObs) {
      return `${patientName}'s most recent weight was ${weightObs.value} ${weightObs.concept.units || ''} recorded on ${new Date(weightObs.obsDatetime).toLocaleDateString()}.`;
    } else {
      return `No weight measurements found for ${patientName}.`;
    }
  }
  else if (question.toLowerCase().includes('visit') || question.toLowerCase().includes('encounter')) {
    if (patientData.encounters.length > 0) {
      const lastEncounter = patientData.encounters[0];
      return `${patientName}'s most recent visit was a ${lastEncounter.encounterType.display} on ${new Date(lastEncounter.encounterDatetime).toLocaleDateString()}.`;
    } else {
      return `No visits recorded for ${patientName}.`;
    }
  }
  else {
    return `I'm a simple mock AI in local development mode. I can answer basic questions about patient name, age, gender, conditions, blood pressure, weight, and recent visits. Try one of these topics for ${patientName}.`;
  }
};

const AiChatPanel = ({ patientData }) => {
  const { settings, updateSettings } = useOpenMRS()
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [useMockAI, setUseMockAI] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const chatContainerRef = useRef(null)
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  
  // Detect if we're in local development
  const isLocalDevelopment = window.location.hostname === 'localhost' || 
                            window.location.hostname === '127.0.0.1'
  
  // Check if we can use AI services
  const canUseOpenAI = settings.aiProvider === 'openai' && !!settings.openAiApiKey
  const canUseOllama = settings.aiProvider === 'ollama' && !!settings.ollamaEndpoint && !!settings.ollamaModel

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
    
    // Determine if we should use mock AI
    if (settings.aiProvider === 'openai' && settings.openAiApiKey) {
      try {
        initializeAI(settings.openAiApiKey)
        setUseMockAI(false)
      } catch (error) {
        console.error('Failed to initialize OpenAI:', error)
        // Fallback to mock AI
        setUseMockAI(true)
      }
    } else if (settings.aiProvider === 'ollama' && settings.ollamaEndpoint && settings.ollamaModel) {
      // When using Ollama, we don't need special initialization
      setUseMockAI(false)
    } else {
      // Use mock AI if no valid AI provider configuration
      setUseMockAI(true)
    }
  }, [messages, settings])

  const handleQuestionSubmit = async () => {
    if (!question || question.trim() === '') return
    
    const userQuestion = question.trim()
    setMessages(prev => [...prev, { type: 'user', content: userQuestion }])
    setQuestion('')
    setIsLoading(true)

    try {
      console.log('Handling question submission with settings:', settings);
      
      if (useMockAI || (!canUseOpenAI && !canUseOllama)) {
        console.log('Using mock AI');
        // Use mock response for local development or if no valid AI configuration
        const response = getMockAIResponse(userQuestion, patientData)
        // Add a small delay to simulate AI thinking
        await new Promise(resolve => setTimeout(resolve, 500))
        setMessages(prev => [...prev, { type: 'ai', content: response }])
      } else {
        console.log('Using real AI:', settings.aiProvider);
        // Use real AI with streaming (works for both OpenAI and Ollama)
        // First add an empty AI message that we'll update as we get chunks
        setMessages(prev => [...prev, { type: 'ai', content: '' }])
        
        // Create a stream update handler
        const handleStreamUpdate = (updatedContent) => {
          console.log('Stream update received, length:', updatedContent.length);
          setMessages(prev => {
            const newMessages = [...prev]
            // Update the last message, which should be the AI response
            newMessages[newMessages.length - 1] = { type: 'ai', content: updatedContent }
            return newMessages
          })
        }
        
        try {
          // Start the streaming request
          console.log('Starting AI request');
          await askAboutPatient(patientData, userQuestion, settings, handleStreamUpdate)
          console.log('AI request completed successfully');
        } catch (aiError) {
          console.error('AI request failed:', aiError);
          
          // Update the empty message with the error
          setMessages(prev => {
            const newMessages = [...prev]
            // Replace the empty message with an error message
            newMessages[newMessages.length - 1] = { 
              type: 'error', 
              content: `Error: ${aiError.message}` 
            }
            return newMessages
          })
          
          throw aiError; // Re-throw to be caught by the outer try/catch
        }
      }
    } catch (error) {
      console.error('AI error:', error)
      toast({
        title: 'AI Response Error',
        description: error.message,
        status: 'error',
        duration: 5000,
      })
      setMessages(prev => [...prev, { 
        type: 'error', 
        content: `Error: ${error.message}` 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleQuestionSubmit()
    }
  }

  // Toggle expanded/collapsed state
  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };

  // Function to handle clicks outside the chat box
  useEffect(() => {
    if (isExpanded) {
      const handleClickOutside = (event) => {
        // Check if the click is outside the chat box
        if (event.target.id === "chat-backdrop") {
          setIsExpanded(false);
        }
      };

      // Add event listener
      document.addEventListener("mousedown", handleClickOutside);
      
      // Clean up
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isExpanded]);

  // Add custom CSS for markdown styling
  useEffect(() => {
    // Create a style element
    const styleEl = document.createElement('style');
    
    // Add markdown styling
    styleEl.innerHTML = `
      .markdown-content {
        font-size: 14px;
        line-height: 1.6;
      }
      .markdown-content p {
        margin-bottom: 0.75rem;
      }
      .markdown-content h1, 
      .markdown-content h2, 
      .markdown-content h3,
      .markdown-content h4 {
        margin-top: 1rem;
        margin-bottom: 0.5rem;
        font-weight: 600;
      }
      .markdown-content h1 { font-size: 1.5rem; }
      .markdown-content h2 { font-size: 1.3rem; }
      .markdown-content h3 { font-size: 1.1rem; }
      .markdown-content h4 { font-size: 1rem; }
      .markdown-content ul, 
      .markdown-content ol {
        margin-left: 1.5rem;
        margin-bottom: 0.75rem;
      }
      .markdown-content li {
        margin-bottom: 0.25rem;
      }
      .markdown-content pre {
        background-color: #f6f8fa;
        border-radius: 3px;
        padding: 0.5rem;
        margin-bottom: 0.75rem;
        overflow-x: auto;
      }
      .markdown-content code {
        background-color: #f6f8fa;
        border-radius: 3px;
        padding: 0.2rem 0.4rem;
        font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
        font-size: 0.9em;
      }
      .markdown-content blockquote {
        border-left: 3px solid #e2e8f0;
        padding-left: 1rem;
        color: #4a5568;
        font-style: italic;
      }
      .markdown-content table {
        border-collapse: collapse;
        width: 100%;
        margin-bottom: 0.75rem;
      }
      .markdown-content th,
      .markdown-content td {
        border: 1px solid #e2e8f0;
        padding: 0.5rem;
        text-align: left;
      }
      .markdown-content th {
        background-color: #f7fafc;
      }
      .markdown-content a {
        color: #3182ce;
        text-decoration: none;
      }
      .markdown-content a:hover {
        text-decoration: underline;
      }
      .markdown-content img {
        max-width: 100%;
        height: auto;
      }
    `;
    
    // Append to document head
    document.head.appendChild(styleEl);
    
    // Clean up
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  return (
    <>
      {/* Overlay when expanded */}
      {isExpanded && (
        <Box
          id="chat-backdrop"
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.600"
          zIndex="999"
        />
      )}
      <Box 
        p={4} 
        h={isExpanded ? "90vh" : "100%"} 
        display="flex" 
        flexDirection="column"
        position={isExpanded ? "fixed" : "relative"}
        top={isExpanded ? "5vh" : "auto"}
        left={isExpanded ? "5vw" : "auto"}
        width={isExpanded ? "90vw" : "auto"}
        zIndex={isExpanded ? 1000 : 1}
        bg="white"
        boxShadow={isExpanded ? "xl" : "none"}
        borderRadius={isExpanded ? "md" : "none"}
      >
      <Flex align="center" justify="space-between" mb={2}>
        <Heading size="md">
          AI Assistant
          {useMockAI ? (
            <Tag size="sm" colorScheme="purple" ml={2}>
              Mock AI
            </Tag>
          ) : settings.aiProvider === 'ollama' ? (
            <Tag size="sm" colorScheme="blue" ml={2}>
              {settings.ollamaModel || 'Ollama'}
            </Tag>
          ) : (
            <Tag size="sm" colorScheme="green" ml={2}>
              OpenAI
            </Tag>
          )}
        </Heading>
        
        <Flex>
          <IconButton
            aria-label={isExpanded ? "Collapse chat" : "Expand chat"}
            icon={isExpanded ? <FaCompressAlt /> : <FaExpandAlt />}
            size="sm"
            onClick={toggleExpanded}
            variant="ghost"
            mr={2}
          />
          <IconButton
            aria-label="AI Settings"
            icon={<FaCog />}
            size="sm"
            onClick={onOpen}
            variant="ghost"
          />
        </Flex>
      </Flex>
      
      <Text fontSize="sm" color="gray.600" mb={4}>
        Ask questions about this patient's data
      </Text>

      <Box 
        ref={chatContainerRef}
        flex="1" 
        overflowY="auto"
        borderWidth="1px"
        borderRadius="md"
        p={3}
        mb={4}
        bg="white"
        maxH={isExpanded ? "70vh" : "auto"}
      >
        {messages.length === 0 ? (
          <Flex 
            height="100%" 
            alignItems="center" 
            justifyContent="center" 
            color="gray.400"
            flexDir="column"
            p={4}
            textAlign="center"
          >
            <Text>Ask a question about this patient</Text>
            <Text fontSize="sm" mt={2}>
              Examples: "What are this patient's active conditions?" or "When was their last blood pressure reading?"
            </Text>
          </Flex>
        ) : (
          <VStack spacing={4} align="stretch">
            {messages.map((msg, index) => (
              <Box 
                key={index} 
                bg={msg.type === 'user' ? 'blue.50' : msg.type === 'error' ? 'red.50' : 'gray.50'}
                p={3}
                borderRadius="md"
                maxW="100%"
                alignSelf={msg.type === 'user' ? 'flex-end' : 'flex-start'}
              >
                <Text 
                  fontSize="xs" 
                  fontWeight="bold" 
                  color={msg.type === 'user' ? 'blue.500' : msg.type === 'error' ? 'red.500' : 'gray.500'}
                  mb={1}
                >
                  {msg.type === 'user' ? 'You' : msg.type === 'error' ? 'Error' : 'AI Assistant'}
                </Text>
                {msg.type === 'ai' ? (
                  <Box className="markdown-content">
                    <ReactMarkdown 
                      rehypePlugins={[rehypeSanitize]} 
                      remarkPlugins={[remarkGfm]}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </Box>
                ) : (
                  <Text whiteSpace="pre-wrap">{msg.content}</Text>
                )}
              </Box>
            ))}
            {isLoading && (
              <Flex justify="flex-start" align="center" p={2}>
                <Spinner size="sm" mr={2} />
                <Text fontSize="sm" color="gray.500">AI is thinking...</Text>
              </Flex>
            )}
          </VStack>
        )}
      </Box>

      <Flex>
        <Textarea
          placeholder="Ask about this patient..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          resize="none"
          rows={2}
          mr={2}
          isDisabled={isLoading}
        />
        <Button
          colorScheme="blue"
          onClick={handleQuestionSubmit}
          isLoading={isLoading}
          isDisabled={!question.trim()}
          alignSelf="flex-end"
        >
          <FaPaperPlane />
        </Button>
      </Flex>
      
      {/* Settings Modal */}
      <SettingsModal isOpen={isOpen} onClose={onClose} />
    </Box>
    </>
  )
}

export default AiChatPanel