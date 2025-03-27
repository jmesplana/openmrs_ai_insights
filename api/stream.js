// Vercel Serverless Function for Streaming API Proxy
const axios = require('axios');

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

  // Get the target URL from the request query parameters
  const baseUrl = req.query.baseUrl || 'https://o2.openmrs.org/openmrs';
  const path = req.query.path || '';
  const url = `${baseUrl}${path}`;
  
  // Get auth credentials if provided
  const authHeader = req.headers.authorization;
  
  try {
    // For stream requests, we need to use responseType: 'stream'
    const axiosResponse = await axios({
      method: req.method,
      url: url,
      data: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body,
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
    
    // Set status and headers
    res.status(axiosResponse.status);
    
    // Copy all headers except those that are problematic
    Object.entries(axiosResponse.headers).forEach(([key, value]) => {
      // Skip headers that might cause issues
      if (!['transfer-encoding', 'connection', 'content-length'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
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
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ 
      error: 'Proxy Error', 
      message: error.message,
      details: error.response?.data || {} 
    });
  }
}