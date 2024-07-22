const fetch = require('node-fetch');

export default async function handler(req, res) {
  const { agentId } = req.body;
  const apiKey = process.env.RETELL_API;

  console.log('Using Agent ID:', agentId);
  console.log('API Key (first 4 chars):', apiKey.substring(0, 4));

  try {
    const response = await fetch('https://api.retellai.com/v2/create-web-call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        agent_id: agentId
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());

    const text = await response.text();
    console.log('Response body:', text);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${text}`);
    }

    const data = JSON.parse(text);

    res.status(200).json({
      callId: data.call_id,
      accessToken: data.access_token,
      sampleRate: 16000 // The documentation doesn't mention sample_rate, so we'll use a default value
    });
  } catch (error) {
    console.error('Error registering call:', error);
    res.status(500).json({ error: error.message });
  }
}
