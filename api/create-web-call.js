import axios from 'axios';

export default async function handler(req, res) {
  console.log('API route called with method:', req.method);
  console.log('Request body:', req.body);

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
      console.log('RETELL_API key (first 4 chars):', process.env.RETELL_API ? process.env.RETELL_API.substring(0, 4) : 'undefined');
      
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
      console.error('Error creating web call:', error);
      console.error('Error response:', error.response ? error.response.data : 'No response data');
      res.status(500).json({ error: 'Failed to create web call', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}