import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { agentId } = req.body;
  const apiKey = process.env.REACT_APP_RETELL_API;

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

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to register call');
    }

    res.status(200).json({
      callId: data.call_id,
      sampleRate: data.sample_rate,
    });
  } catch (error) {
    console.error('Error registering call:', error);
    res.status(500).json({ error: 'Failed to register call' });
  }
}
