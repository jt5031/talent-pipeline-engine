const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 5001; // Set to 5001 to resolve macOS port 5000 conflict
const PYTHON_SERVICE_URL = 'http://localhost:8000/api/v1/rank-candidates';

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'node-orchestrator' });
});

// 1. Ingest candidates and trigger Python ranking analysis
app.post('/api/evaluate', async (req, res) => {
    try {
        const { job_title, required_skills, candidates, top_k } = req.body;

        const pythonResponse = await axios.post(PYTHON_SERVICE_URL, {
            job_title,
            required_skills,
            candidates,
            top_k: top_k || 5
        });

        res.json({
            success: true,
            message: "Candidates successfully evaluated and ranked.",
            data: pythonResponse.data
        });
    } catch (error) {
        console.error("Error communicating with Python service:", error.message);
        res.status(500).json({ 
            success: false, 
            error: "Failed to connect to analytics engine. Is FastAPI running on port 8000?" 
        });
    }
});

// 2. Simulate asynchronous outreach
app.post('/api/outreach', async (req, res) => {
    const { candidateIds, channel } = req.body;

    if (!candidateIds || !Array.isArray(candidateIds)) {
        return res.status(400).json({ error: "Invalid candidate IDs provided." });
    }

    setTimeout(() => {
        console.log(`[Outreach Worker] Successfully dispatched ${channel.toUpperCase()} to candidates:`, candidateIds);
    }, 1500);

    res.json({
        success: true,
        message: `Outreach queue triggered for ${candidateIds.length} candidates via ${channel.toUpperCase()}.`
    });
});

app.listen(PORT, () => {
    console.log(`Node.js orchestrator running on http://localhost:${PORT}`);
});