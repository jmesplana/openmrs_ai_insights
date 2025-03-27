const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = 3001;

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'OpenMRS AI Proxy Server is running. Use /api route for proxy requests.' });
});

// Proxy middleware
app.use('/api', async (req, res) => {
  // Get the target URL from the request
  const baseUrl = req.query.baseUrl || 'https://o2.openmrs.org/openmrs';
  const path = req.query.path || '';
  const url = `${baseUrl}${path}`;
  
  // Get auth credentials
  const authHeader = req.headers.authorization;
  
  // Check if streaming is requested
  const shouldStream = req.query.stream === 'true';
  
  console.log('Proxy request:', {
    method: req.method,
    url,
    shouldStream,
    bodySize: req.body ? JSON.stringify(req.body).length : 0
  });
  
  try {
    if (shouldStream) {
      // Streaming mode
      console.log('Using streaming mode for:', url);
      
      const axiosResponse = await axios({
        method: req.method,
        url: url,
        data: req.method !== 'GET' ? req.body : undefined,
        headers: {
          ...req.headers,
          host: new URL(baseUrl).host,
        },
        auth: authHeader ? {
          username: Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':')[0],
          password: Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':')[1]
        } : undefined,
        responseType: 'stream', // Enable streaming
        validateStatus: () => true, // Accept any status code
      });
      
      console.log('Stream response status:', axiosResponse.status);
      
      // Set status and headers
      res.status(axiosResponse.status);
      Object.entries(axiosResponse.headers).forEach(([key, value]) => {
        // Don't copy content-length as it may be incorrect for streaming
        if (key.toLowerCase() !== 'content-length') {
          res.set(key, value);
        }
      });
      
      // Pipe the response stream to the client
      axiosResponse.data.pipe(res);
      
      // Handle errors in the stream
      axiosResponse.data.on('error', (error) => {
        console.error('Stream error:', error.message);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Stream Error', message: error.message });
        } else {
          res.end();
        }
      });
    } else {
      // Non-streaming mode (original behavior)
      console.log('Using non-streaming mode for:', url);
      
      const response = await axios({
        method: req.method,
        url: url,
        data: req.method !== 'GET' ? req.body : undefined,
        headers: {
          ...req.headers,
          host: new URL(baseUrl).host,
        },
        auth: authHeader ? {
          username: Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':')[0],
          password: Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':')[1]
        } : undefined,
        validateStatus: () => true, // Accept any status code
      });

      console.log('Response status:', response.status);
      
      // Forward the response back to the client
      res.status(response.status);
      res.set(response.headers);
      res.send(response.data);
    }
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ 
      error: 'Proxy Error', 
      message: error.message,
      details: error.response?.data || {} 
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Local proxy server running at http://localhost:${port}`);
});