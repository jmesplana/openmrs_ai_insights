// Vercel Serverless Function for API Proxy
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
  
  console.log('-------------------- START REQUEST ------------------');
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
        message: 'Missing baseUrl parameter. Please provide a valid OpenMRS server URL.' 
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
    console.log('Target URL:', url);
    
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
      config.data = req.body;
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
    
    console.log('Making request with config:', {
      method: config.method,
      url: config.url,
      hasAuth: !!config.auth,
      headers: Object.keys(config.headers)
    });
    
    // Make the request
    const response = await instance(config);
    
    console.log('Response received:', {
      status: response.status,
      headers: response.headers ? Object.keys(response.headers) : 'none'
    });
    
    // Forward the status code
    res.status(response.status);
    
    // Copy relevant headers from the response
    if (response.headers) {
      for (const [key, value] of Object.entries(response.headers)) {
        if (!['transfer-encoding', 'connection'].includes(key.toLowerCase())) {
          res.setHeader(key, value);
        }
      }
    }
    
    // Send the response data
    console.log('Sending response to client');
    console.log('-------------------- END REQUEST ------------------');
    
    // Handle different response types
    res.send(response.data);
  } catch (error) {
    console.error('Proxy error details:', error);
    
    // Create a detailed error response
    const errorResponse = { 
      error: 'Proxy Error', 
      message: error.message || 'Unknown proxy error',
      code: error.code || '500'
    };
    
    // Add specific details based on error type
    if (error.response) {
      errorResponse.statusCode = error.response.status;
      errorResponse.statusText = error.response.statusText;
      
      console.error('Server error response:', {
        status: error.response.status,
        statusText: error.response.statusText
      });
      
      if (error.response.status === 401) {
        errorResponse.message = 'Authentication failed. Please check your username and password.';
      }
    } else if (error.request) {
      errorResponse.message = 'Unable to connect to the OpenMRS server. Please check the server URL and ensure it is accessible.';
      console.error('No response received');
    }
    
    console.error('Sending error response:', errorResponse);
    console.log('-------------------- END REQUEST WITH ERROR ------------------');
    
    res.status(500).json(errorResponse);
  }
}