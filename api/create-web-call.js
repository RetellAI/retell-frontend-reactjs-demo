import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { agent_id, metadata, retell_llm_dynamic_variables } = req.body;

  // Prepare the payload for the API request
  const payload = { agent_id };

  // Conditionally add optional fields if they are provided
  if (metadata) {
    payload.metadata = metadata;
  }

  if (retell_llm_dynamic_variables) {
    payload.retell_llm_dynamic_variables = retell_llm_dynamic_variables;
  }

  try {
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

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Error creating web call:', error.response?.data || error.message);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ error: 'Failed to create web call' });
  }
}