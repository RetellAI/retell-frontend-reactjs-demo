const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 8080;
const apiKey = process.env.RETELL_API_KEY;
const versionHeaders = [
    'X-Retell-Client-JS-SDK-Min-Version',
    'X-Retell-Client-JS-SDK-Recommended-Version',
];

if (!apiKey) {
    throw new Error('Set RETELL_API_KEY in example_backend/.env before starting the server.');
}

app.use(cors({ origin: 'http://localhost:3000', exposedHeaders: versionHeaders }));
app.use(express.json());

function forwardVersionHeaders(res, headers) {
    for (const header of versionHeaders) {
        const value = headers?.[header.toLowerCase()];
        if (value) res.set(header, value);
    }
}

async function forwardCallRequest(req, res, path) {
    const headers = {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
    };
    const sdkVersion = req.get('X-Retell-Client-JS-SDK-Version');
    if (sdkVersion) headers['X-Retell-Client-JS-SDK-Version'] = sdkVersion;

    try {
        const response = await axios.post(`https://api.retellai.com${path}`, req.body, { headers });
        forwardVersionHeaders(res, response.headers);
        res.status(response.status).json(response.data);
    } catch (error) {
        forwardVersionHeaders(res, error.response?.headers);
        const status = error.response?.status || 502;
        const body = error.response?.data || { error: error.message };
        console.error('Retell request failed:', status, body);
        res.status(status).json(body);
    }
}

app.post('/v3/create-web-call', (req, res) =>
    forwardCallRequest(req, res, '/v3/create-web-call')
);

// The SDK uses this when a call is cancelled while creation is still in flight.
app.post('/v2/stop-call/:callId', (req, res) =>
    forwardCallRequest(req, res, `/v2/stop-call/${encodeURIComponent(req.params.callId)}`)
);

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}

module.exports = app;
