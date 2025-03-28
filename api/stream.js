// Vercel Serverless Function for Streaming API Proxy
const axios = require('axios');
const https = require('https');

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  console.log('-------------------- START STREAM REQUEST ------------------');
  console.log('Full request URL:', req.url);
  console.log('HTTP method:', req.method);
  
  try {
    // Get the target URL from the request query parameters
    const baseUrl = req.query.baseUrl;
    const path = req.query.path || '';
    
    // Validate the baseUrl is provided
    if (!baseUrl) {
      console.error('Missing baseUrl parameter');
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: 'Missing baseUrl parameter. Please provide a valid streaming server URL.' 
      });
    }
    
    // Extract credentials from query parameters or headers
    let username = req.query.username || '';
    let password = req.query.password || '';
    
    // Check authorization header if no query credentials
    if ((!username || !password) && req.headers.authorization) {
      try {
        const base64Credentials = req.headers.authorization.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString();
        [username, password] = credentials.split(':');
        console.log('Using credentials from authorization header');
      } catch (authError) {
        console.error('Failed to parse auth header:', authError.message);
      }
    }
    
    // If we have credentials, log it
    if (username && password) {
      console.log('Using credentials for:', username);
    } else {
      console.warn('No credentials provided, request may fail');
    }
    
    // Construct the URL
    const url = `${baseUrl}${path}`;
    console.log('Target streaming URL:', url);
    
    // Create a custom axios instance with allow self-signed certs option
    const instance = axios.create({
      httpsAgent: new https.Agent({  
        rejectUnauthorized: false
      }),
      timeout: 30000 // 30 second timeout
    });
    
    // Prepare the request config
    const config = {
      method: req.method,
      url: url,
      headers: {},
      responseType: 'stream', // Critical for streaming
      validateStatus: () => true // Accept any status code
    };
    
    // Add authentication if we have it
    if (username && password) {
      config.auth = {
        username,
        password
      };
    }
    
    // Add data for non-GET requests
    if (!['GET', 'HEAD'].includes(req.method) && req.body) {
      // Handle JSON bodies
      if (req.headers['content-type']?.includes('application/json') && 
          typeof req.body === 'string') {
        try {
          config.data = JSON.parse(req.body);
          console.log('Parsed JSON body for streaming request');
        } catch (err) {
          console.warn('Failed to parse JSON body:', err.message);
          config.data = req.body;
        }
      } else {
        config.data = req.body;
      }
    }
    
    // Copy relevant headers
    const ignoreHeaders = ['host', 'connection', 'content-length', 'authorization'];
    for (const [key, value] of Object.entries(req.headers)) {
      if (!ignoreHeaders.includes(key.toLowerCase())) {
        config.headers[key] = value;
      }
    }
    
    // Set the appropriate host header
    config.headers.host = new URL(baseUrl).host;
    
    console.log('Making streaming request with config:', {
      method: config.method,
      url: config.url,
      hasAuth: !!config.auth,
      headers: Object.keys(config.headers)
    });
    
    // Make the streaming request
    const response = await instance(config);
    
    console.log('Stream response received, status:', response.status);
    
    // Set the status code
    res.status(response.status);
    
    // Copy relevant headers from the response
    if (response.headers) {
      for (const [key, value] of Object.entries(response.headers)) {
        if (!['transfer-encoding', 'connection', 'content-length'].includes(key.toLowerCase())) {
          res.setHeader(key, value);
        }
      }
    }
    
    // Pipe the stream to the client
    console.log('Piping stream to client');
    response.data.pipe(res);
    
    // Handle stream events
    response.data.on('error', (error) => {
      console.error('Stream error:', error.message);
      // Only send an error response if headers haven't been sent yet
      if (!res.headersSent) {
        res.status(500).json({ error: 'Stream Error', message: error.message });
      } else {
        res.end();
      }
    });
    
    response.data.on('end', () => {
      console.log('Stream completed successfully');
      console.log('-------------------- END STREAM REQUEST ------------------');
    });
  } catch (error) {
    console.error('Stream proxy error:', error.message);
    
    // Create error response
    const errorResponse = { 
      error: 'Stream Proxy Error', 
      message: error.message || 'Unknown streaming error',
      code: error.code || '500'
    };
    
    // Add specific details based on error type
    if (error.response) {
      errorResponse.statusCode = error.response.status;
      errorResponse.statusText = error.response.statusText;
      
      if (error.response.status === 401) {
        errorResponse.message = 'Authentication failed. Please check your username and password.';
      }
    } else if (error.request) {
      errorResponse.message = 'Unable to connect to the streaming server. Please check the server URL and ensure it is accessible.';
    }
    
    console.error('Sending error response:', errorResponse);
    console.log('-------------------- END STREAM REQUEST WITH ERROR ------------------');
    
    res.status(500).json(errorResponse);
  }
}