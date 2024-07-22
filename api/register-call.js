const fetch = require('node-fetch');

export default async function handler(req, res) {
  const { agentId } = req.body;
  const apiKey = process.env.RETELL_API;

  try {
    const response = await fetch('https://api.retellai.com/call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        agent_id: agentId,
        stream_out_on_begin: true,
      }),
    });

    // Log the response status and headers
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());

    const text = await response.text();
    console.log('Response body:', text);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${text}`);
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error(`Invalid JSON: ${text}`);
    }

    res.status(200).json({
      callId: data.call_id,
      sampleRate: data.sample_rate,
    });
  } catch (error) {
    console.error('Error registering call:', error);
    res.status(500).json({ error: error.message });
  }
}
