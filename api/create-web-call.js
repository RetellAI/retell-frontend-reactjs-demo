import axios from 'axios';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    const { agent_id, metadata, retell_llm_dynamic_variables } = req.body;
    const payload = { agent_id };
    if (metadata) payload.metadata = metadata;
    if (retell_llm_dynamic_variables) payload.retell_llm_dynamic_variables = retell_llm_dynamic_variables;

    try {
      console.log('Sending request to Retell API with payload:', JSON.stringify(payload));
      const response = await axios.post(
        'https://api.retellai.com/v2/create-web-call',
        payload,
        {
          headers: {
            'Authorization': `Bearer ${process.env.RETELL_API}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Received response from Retell API:', response.data);
      res.status(201).json(response.data);
    } catch (error) {
      console.error('Error creating web call:', error.response?.data || error.message);
      res.status(500).json({ error: 'Failed to create web call', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}