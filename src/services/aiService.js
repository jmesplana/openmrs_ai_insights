import OpenAI from 'openai'

// Note: This uses client-side OpenAI which requires an API key
// For production, this should be moved to a backend service
let openai = null

export const initializeAI = (apiKey) => {
  openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true // Only for demo purposes
  })
}

export const askAboutPatient = async (patientData, question, settings, onStreamUpdate = null) => {
  // If we're using Ollama, redirect to the Ollama service
  if (settings.aiProvider === 'ollama') {
    return askAboutPatientWithOllama(patientData, question, settings, onStreamUpdate);
  }

  // If we have an API key in settings, initialize OpenAI
  if (settings && settings.openAiApiKey && !openai) {
    initializeAI(settings.openAiApiKey)
  }

  if (!openai) {
    throw new Error('AI service not initialized. Please provide an OpenAI API key.')
  }

  if (!patientData) {
    throw new Error('No patient data available')
  }

  try {
    // Prepare a context with relevant patient information
    const patientContext = {
      demographics: {
        name: patientData.demographics.person.display,
        gender: patientData.demographics.person.gender,
        age: patientData.demographics.person.age,
        birthdate: patientData.demographics.person.birthdate,
        addresses: patientData.demographics.person.addresses,
      },
      identifiers: patientData.demographics.identifiers,
      conditions: patientData.conditions.map(c => ({
        condition: c.condition.display,
        status: c.clinicalStatus?.display || 'Unknown',
        onsetDate: c.onsetDate,
        endDate: c.endDate,
        notes: c.additionalDetail
      })),
      encounters: patientData.encounters.map(e => ({
        date: e.encounterDatetime,
        type: e.encounterType.display,
        location: e.location?.display,
        provider: e.encounterProviders?.[0]?.provider?.display || 'Unknown',
        diagnoses: e.diagnoses || []
      })),
      observations: patientData.observations.map(o => ({
        date: o.obsDatetime,
        concept: o.concept.display,
        value: o.value?.display || o.value,
        normal: o.normal,
        unit: o.concept.units
      }))
    }

    // Check if we are streaming (when onStreamUpdate callback is provided)
    if (onStreamUpdate) {
      // Using streaming API
      const stream = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful medical assistant AI that answers questions about patient data. Provide clear, concise responses based only on the information available in the patient record. If the data doesn't contain information to answer a question, clearly state that the information is not available. Format your responses using Markdown for better readability. Use headings, lists, tables, and code blocks as appropriate."
          },
          {
            role: "user", 
            content: `Here is the patient data:\n${JSON.stringify(patientContext, null, 2)}\n\nQuestion: ${question}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
        stream: true,
      });
      
      let fullResponse = "";
      
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullResponse += content;
          onStreamUpdate(fullResponse);
        }
      }
      
      return fullResponse;
    } else {
      // Using non-streaming API (original behavior)
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful medical assistant AI that answers questions about patient data. Provide clear, concise responses based only on the information available in the patient record. If the data doesn't contain information to answer a question, clearly state that the information is not available. Format your responses using Markdown for better readability. Use headings, lists, tables, and code blocks as appropriate."
          },
          {
            role: "user", 
            content: `Here is the patient data:\n${JSON.stringify(patientContext, null, 2)}\n\nQuestion: ${question}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      })

      return completion.choices[0].message.content
    }
  } catch (error) {
    console.error('AI question answering failed:', error)
    throw new Error('Failed to get AI response: ' + error.message)
  }
}

// Ollama Service Integration
export const askAboutPatientWithOllama = async (patientData, question, settings, onStreamUpdate = null) => {
  if (!patientData) {
    throw new Error('No patient data available')
  }

  if (!settings.ollamaEndpoint) {
    throw new Error('Ollama endpoint not specified')
  }

  if (!settings.ollamaModel) {
    throw new Error('Ollama model not specified')
  }

  try {
    // Prepare a context with relevant patient information
    const patientContext = {
      demographics: {
        name: patientData.demographics.person.display,
        gender: patientData.demographics.person.gender,
        age: patientData.demographics.person.age,
        birthdate: patientData.demographics.person.birthdate,
        addresses: patientData.demographics.person.addresses,
      },
      identifiers: patientData.demographics.identifiers,
      conditions: patientData.conditions.map(c => ({
        condition: c.condition.display,
        status: c.clinicalStatus?.display || 'Unknown',
        onsetDate: c.onsetDate,
        endDate: c.endDate,
        notes: c.additionalDetail
      })),
      encounters: patientData.encounters.map(e => ({
        date: e.encounterDatetime,
        type: e.encounterType.display,
        location: e.location?.display,
        provider: e.encounterProviders?.[0]?.provider?.display || 'Unknown',
        diagnoses: e.diagnoses || []
      })),
      observations: patientData.observations.map(o => ({
        date: o.obsDatetime,
        concept: o.concept.display,
        value: o.value?.display || o.value,
        normal: o.normal,
        unit: o.concept.units
      }))
    }

    const systemPrompt = "You are a helpful medical assistant AI that answers questions about patient data. Provide clear, concise responses based only on the information available in the patient record. If the data doesn't contain information to answer a question, clearly state that the information is not available. Format your responses using Markdown for better readability. Use headings, lists, tables, and code blocks as appropriate.";
    
    // Format the patient data in a more readable way for Ollama
    let formattedData = '';
    
    // Demographics
    formattedData += `## Patient Demographics\n`;
    formattedData += `- Name: ${patientContext.demographics.name}\n`;
    formattedData += `- Gender: ${patientContext.demographics.gender}\n`;
    formattedData += `- Age: ${patientContext.demographics.age} years\n`;
    formattedData += `- Birthdate: ${patientContext.demographics.birthdate}\n`;
    
    // Identifiers
    if (patientContext.identifiers && patientContext.identifiers.length > 0) {
      formattedData += `\n## Patient Identifiers\n`;
      patientContext.identifiers.forEach(id => {
        formattedData += `- ${id.display || id.identifier}\n`;
      });
    }
    
    // Conditions
    if (patientContext.conditions && patientContext.conditions.length > 0) {
      formattedData += `\n## Medical Conditions\n`;
      patientContext.conditions.forEach(condition => {
        formattedData += `- Condition: ${condition.condition}\n`;
        formattedData += `  Status: ${condition.status}\n`;
        if (condition.onsetDate) formattedData += `  Onset Date: ${condition.onsetDate}\n`;
        if (condition.endDate) formattedData += `  End Date: ${condition.endDate}\n`;
        if (condition.notes) formattedData += `  Notes: ${condition.notes}\n`;
        formattedData += `\n`;
      });
    }
    
    // Encounters
    if (patientContext.encounters && patientContext.encounters.length > 0) {
      formattedData += `\n## Recent Encounters\n`;
      patientContext.encounters.forEach(encounter => {
        formattedData += `- Type: ${encounter.type}\n`;
        formattedData += `  Date: ${encounter.date}\n`;
        if (encounter.location) formattedData += `  Location: ${encounter.location}\n`;
        if (encounter.provider) formattedData += `  Provider: ${encounter.provider}\n`;
        formattedData += `\n`;
      });
    }
    
    // Observations
    if (patientContext.observations && patientContext.observations.length > 0) {
      formattedData += `\n## Observations\n`;
      patientContext.observations.forEach(obs => {
        formattedData += `- ${obs.concept}: ${obs.value} ${obs.unit || ''}\n`;
        formattedData += `  Date: ${obs.date}\n`;
        if (obs.normal) formattedData += `  Normal Range: ${obs.normal}\n`;
        formattedData += `\n`;
      });
    }
    
    const userPrompt = `Here is the patient data:\n\n${formattedData}\n\nQuestion: ${question}`;
    
    // Ensure the endpoint has a protocol
    let baseEndpoint = settings.ollamaEndpoint;
    if (!baseEndpoint.startsWith('http://') && !baseEndpoint.startsWith('https://')) {
      baseEndpoint = 'http://' + baseEndpoint;
    }
    
    // Make sure the endpoint doesn't have a trailing slash
    baseEndpoint = baseEndpoint.endsWith('/') ? 
      baseEndpoint.slice(0, -1) : baseEndpoint;
    
    // Use the local proxy for non-localhost endpoints to avoid CORS issues
    const isLocalhost = baseEndpoint.includes('localhost') || baseEndpoint.includes('127.0.0.1');
    
    // Try with /api/chat first, then fall back to /api/generate if that fails
    let useGenerateAPI = false;
    let endpoint = isLocalhost ? 
      `${baseEndpoint}/api/chat` : 
      `/api?baseUrl=${encodeURIComponent(baseEndpoint)}&path=${encodeURIComponent('/api/chat')}&stream=${onStreamUpdate ? 'true' : 'false'}`;
    
    // Check if we are streaming
    if (onStreamUpdate) {
      // Request body for Ollama
      // Ollama with the /api/chat endpoint expects this format
      const requestBody = {
        model: settings.ollamaModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        stream: true,
        options: {
          temperature: 0.3,
        }
      };
      
      // Log the actual endpoint
      console.log('Using Ollama endpoint:', settings.ollamaEndpoint);
      console.log('Using Ollama model:', settings.ollamaModel);
      
      console.log('Streaming request to:', endpoint);
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      
      // Using streaming API
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        console.error('Ollama API error:', response.status, response.statusText);
        // Try to get the error details
        try {
          const errorText = await response.text();
          console.error('Error details:', errorText);
          throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
        } catch (e) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      
      console.log('Stream response received');
      
      // Set up the reader for streaming
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";
      let errorOccurred = false;
      
      try {
        console.log('Starting to read stream...');
        let chunkCount = 0;
        
        while (true) {
          const { value, done } = await reader.read();
          
          if (done) {
            console.log('Stream complete, received', chunkCount, 'chunks');
            break;
          }
          
          // Decode the stream chunk
          const chunk = decoder.decode(value);
          chunkCount++;
          
          console.log(`Chunk ${chunkCount} received:`, chunk.length > 100 ? chunk.substring(0, 100) + '...' : chunk);
          
          // Process each line
          const lines = chunk.split('\n').filter(line => line.trim());
          console.log('Lines in chunk:', lines.length);
          
          for (const line of lines) {
            try {
              // Ollama can have different response formats
              if (line.startsWith('data: ')) {
                const jsonStr = line.slice(6);
                if (jsonStr === '[DONE]') {
                  console.log('Received [DONE] marker');
                  continue;
                }
                
                try {
                  const data = JSON.parse(jsonStr);
                  console.log('Parsed data:', data);
                  
                  // Handle different response formats
                  if (data.message?.content) {
                    fullResponse += data.message.content;
                    onStreamUpdate(fullResponse);
                    console.log('Updated response with message content');
                  } else if (data.response) {
                    // Direct response format
                    fullResponse += data.response;
                    onStreamUpdate(fullResponse);
                    console.log('Updated response with direct response');
                  }
                } catch (parseErr) {
                  console.warn('Error parsing JSON data:', parseErr, 'in line:', jsonStr);
                }
              } else if (line.startsWith('{') && line.endsWith('}')) {
                // Try to handle direct JSON without 'data:' prefix
                try {
                  const data = JSON.parse(line);
                  console.log('Parsed direct JSON:', data);
                  
                  if (data.message?.content) {
                    fullResponse += data.message.content;
                    onStreamUpdate(fullResponse);
                    console.log('Updated response with direct JSON message content');
                  } else if (data.response) {
                    fullResponse += data.response;
                    onStreamUpdate(fullResponse);
                    console.log('Updated response with direct JSON response');
                  }
                } catch (parseErr) {
                  console.warn('Error parsing direct JSON:', parseErr);
                }
              } else {
                console.log('Unrecognized line format:', line);
              }
            } catch (err) {
              console.warn('Error processing line:', err);
            }
          }
        }
      } catch (streamErr) {
        console.error('Stream processing error:', streamErr);
        errorOccurred = true;
        
        // Try falling back to the /api/generate endpoint
        if (!fullResponse) {
          try {
            console.log('Falling back to /api/generate endpoint...');
            
            // Create the generate endpoint
            const generateEndpoint = isLocalhost ? 
              `${baseEndpoint}/api/generate` : 
              `/api?baseUrl=${encodeURIComponent(baseEndpoint)}&path=${encodeURIComponent('/api/generate')}&stream=${onStreamUpdate ? 'true' : 'false'}`;
            
            // Format the prompt for the generate API - for the generate endpoint, 
            // we need to be more explicit with instructions since it doesn't have the chat format
            const combinedPrompt = `${systemPrompt}\n\nBelow is patient information. Answer questions about this patient data only.\n\n${formattedData}\n\nQuestion: ${question}\n\nAnswer:`;
            
            const generateBody = {
              model: settings.ollamaModel,
              prompt: combinedPrompt,
              stream: true,
              options: {
                temperature: 0.3,
              }
            };
            
            console.log('Generate fallback request to:', generateEndpoint);
            
            const generateResponse = await fetch(generateEndpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(generateBody),
            });
            
            if (!generateResponse.ok) {
              throw new Error(`Generate API HTTP error! status: ${generateResponse.status}`);
            }
            
            console.log('Generate stream response received');
            const genReader = generateResponse.body.getReader();
            
            fullResponse = "";
            
            // Process the generate stream
            while (true) {
              const { value, done } = await genReader.read();
              
              if (done) break;
              
              const chunk = decoder.decode(value);
              const lines = chunk.split('\n').filter(line => line.trim());
              
              for (const line of lines) {
                try {
                  const data = JSON.parse(line);
                  if (data.response) {
                    fullResponse += data.response;
                    onStreamUpdate(fullResponse);
                  }
                } catch (err) {
                  console.warn('Error parsing generate response:', err);
                }
              }
            }
            
            genReader.releaseLock();
            console.log('Fallback successful, got response length:', fullResponse.length);
            return fullResponse;
          } catch (fallbackErr) {
            console.error('Fallback to generate failed:', fallbackErr);
            throw streamErr; // Throw the original error
          }
        }
        
        throw streamErr;
      } finally {
        reader.releaseLock();
        console.log('Stream reader released');
      }
      
      return fullResponse;
    } else {
      // Non-streaming API
      // Request body for Ollama
      const requestBody = {
        model: settings.ollamaModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        options: {
          temperature: 0.3,
        }
      };
      
      console.log('Non-streaming request to:', endpoint);
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      
      // Try the chat API first
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
  
        if (!response.ok) {
          console.error('Ollama API error:', response.status, response.statusText);
          // Try to get the error details
          const errorText = await response.text();
          console.error('Error details:', errorText);
          throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
        }
        
        console.log('Response received, parsing JSON...');
        
        try {
          const data = await response.json();
          console.log('Response data:', data);
          
          // Handle different response formats
          if (data.message?.content) {
            return data.message.content;
          } else if (data.response) {
            return data.response;
          } else {
            console.warn('Unexpected response format:', data);
            return JSON.stringify(data) || 'No response content';
          }
        } catch (parseError) {
          console.error('Failed to parse JSON response:', parseError);
          const text = await response.text();
          console.log('Raw response:', text);
          return text || 'Failed to parse response';
        }
      } catch (chatApiError) {
        // If chat API fails, try the generate API
        console.log('Chat API failed, falling back to /api/generate endpoint...', chatApiError);
        
        // Create the generate endpoint
        const generateEndpoint = isLocalhost ? 
          `${baseEndpoint}/api/generate` : 
          `/api?baseUrl=${encodeURIComponent(baseEndpoint)}&path=${encodeURIComponent('/api/generate')}&stream=false`;
        
        // Format the prompt for the generate API - for the generate endpoint, 
        // we need to be more explicit with instructions since it doesn't have the chat format
        const combinedPrompt = `${systemPrompt}\n\nBelow is patient information. Answer questions about this patient data only.\n\n${formattedData}\n\nQuestion: ${question}\n\nAnswer:`;
        
        const generateBody = {
          model: settings.ollamaModel,
          prompt: combinedPrompt,
          options: {
            temperature: 0.3,
          }
        };
        
        console.log('Generate fallback request to:', generateEndpoint);
        
        const generateResponse = await fetch(generateEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(generateBody),
        });
        
        if (!generateResponse.ok) {
          console.error('Generate API error:', generateResponse.status, generateResponse.statusText);
          throw new Error(`Generate API error: ${generateResponse.status}`);
        }
        
        try {
          const data = await generateResponse.json();
          console.log('Generate response data:', data);
          return data.response || JSON.stringify(data);
        } catch (parseError) {
          console.error('Failed to parse generate response:', parseError);
          const text = await generateResponse.text();
          console.log('Raw generate response:', text);
          return text || 'Failed to parse generate response';
        }
      }
      
      // This should never be reached because either the chat API or generate API
      // should have returned a response or thrown an error.
      throw new Error('Both chat and generate APIs failed to provide a response');
    }
  } catch (error) {
    console.error('Ollama query failed:', error);
    throw new Error(`Failed to get Ollama response: ${error.message}`);
  }
}

// Fetch available Ollama models
export const fetchOllamaModels = async (endpoint) => {
  try {
    // Ensure the endpoint has a protocol
    let baseEndpoint = endpoint;
    if (!baseEndpoint.startsWith('http://') && !baseEndpoint.startsWith('https://')) {
      baseEndpoint = 'http://' + baseEndpoint;
    }
    
    // Make sure the endpoint doesn't have a trailing slash
    baseEndpoint = baseEndpoint.endsWith('/') ? baseEndpoint.slice(0, -1) : baseEndpoint;
    
    // Try with the newer API endpoint first
    try {
      const modelsEndpoint = `${baseEndpoint}/api/tags`;
      
      // Add CORS proxy if endpoint is not localhost
      const isLocal = baseEndpoint.includes('localhost') || baseEndpoint.includes('127.0.0.1');
      const finalEndpoint = isLocal ? 
        modelsEndpoint : 
        `/api?baseUrl=${encodeURIComponent(baseEndpoint)}&path=${encodeURIComponent('/api/tags')}&stream=false`;
      
      console.log('Fetching models from:', finalEndpoint);
      
      const response = await fetch(finalEndpoint);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.warn('Failed to fetch with /api/tags, trying /api/tags/list:', error);
      
      // Fall back to the older API endpoint
      const modelsEndpoint = `${baseEndpoint}/api/tags/list`;
      
      // Add CORS proxy if endpoint is not localhost
      const isLocal = baseEndpoint.includes('localhost') || baseEndpoint.includes('127.0.0.1');
      const finalEndpoint = isLocal ? 
        modelsEndpoint : 
        `/api?baseUrl=${encodeURIComponent(baseEndpoint)}&path=${encodeURIComponent('/api/tags/list')}&stream=false`;
      
      console.log('Falling back to:', finalEndpoint);
      
      const response = await fetch(finalEndpoint);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.models || [];
    }
  } catch (error) {
    console.error('Failed to fetch Ollama models:', error);
    throw new Error(`Failed to fetch Ollama models: ${error.message}`);
  }
}

// Test Ollama connection
export const testOllamaConnection = async (endpoint) => {
  try {
    // Ensure the endpoint has a protocol
    let baseEndpoint = endpoint;
    if (!baseEndpoint.startsWith('http://') && !baseEndpoint.startsWith('https://')) {
      baseEndpoint = 'http://' + baseEndpoint;
    }
    
    // Make sure the endpoint doesn't have a trailing slash
    baseEndpoint = baseEndpoint.endsWith('/') ? baseEndpoint.slice(0, -1) : baseEndpoint;
    
    // Use the local proxy for non-localhost endpoints to avoid CORS issues
    const isLocal = baseEndpoint.includes('localhost') || baseEndpoint.includes('127.0.0.1');
    const versionEndpoint = isLocal ? 
      `${baseEndpoint}/api/version` : 
      `/api?baseUrl=${encodeURIComponent(baseEndpoint)}&path=${encodeURIComponent('/api/version')}&stream=false`;
    
    console.log('Testing connection to:', versionEndpoint);
    
    const response = await fetch(versionEndpoint);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, version: data.version };
  } catch (error) {
    console.error('Ollama connection test failed:', error);
    return { success: false, error: error.message };
  }
}

export default {
  initializeAI,
  askAboutPatient,
  askAboutPatientWithOllama,
  fetchOllamaModels,
  testOllamaConnection
}