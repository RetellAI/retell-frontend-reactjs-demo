import fetch from 'node-fetch';

export default async function handler(req, res) {
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
    const response = await fetch('https://api.retellai.com/v2/create-web-call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ agent_id }),
    });

    const data = await response.json();
    console.log('Retell API response:', response.status, JSON.stringify(data));

    if (!response.ok) {
      throw new Error(`Retell API error: ${response.status} ${JSON.stringify(data)}`);
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating web call:', error);
    res.status(500).json({ 
      error: 'Failed to create web call', 
      details: error.message
    });
  }
}