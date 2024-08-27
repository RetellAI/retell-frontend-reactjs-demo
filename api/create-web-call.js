const axios = require('axios');

module.exports = async function handler(req, res) {
  console.log('API route called with method:', req.method);
  console.log('Request body:', JSON.stringify(req.body));

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { agent_id } = req.body;
  const apiKey = process.env.RETELL_API;

  console.log('Agent ID:', agent_id);
  console.log('API Key (first 4 chars):', apiKey ? apiKey.substring(0, 4) : 'undefined');

  try {
    const response = await axios.post('https://api.retellai.com/v2/create-web-call', 
      { agent_id },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Retell API response:', response.status, JSON.stringify(response.data));
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error creating web call:', error.response ? error.response.data : error.message);
    res.status(error.response ? error.response.status : 500).json({ 
      error: 'Failed to create web call', 
      details: error.response ? error.response.data : error.message
    });
  }
};