import React, { useState } from 'react';
import axios from 'axios';

// Connects to Node.js backend running on port 5001
const API_BASE_URL = 'http://localhost:5001/api';

function App() {
  const [jobTitle, setJobTitle] = useState('Senior AI Software Engineer');
  const [requiredSkills, setRequiredSkills] = useState('python, fastapi, react, sql');
  const [loading, setLoading] = useState(false);
  const [rankedData, setRankedData] = useState(null);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [outreachStatus, setOutreachStatus] = useState('');

  const sampleCandidates = [
    {
      id: "cand_01",
      name: "Alex Rivera",
      resume_text: "Full-stack engineer with strong background in Python, FastAPI, and React building scalable backend systems.",
      skills: ["python", "fastapi", "react"],
      years_experience: 4.0,
      required_years: 3.0
    },
    {
      id: "cand_02",
      name: "Sam Chen",
      resume_text: "Data engineer specializing in SQL databases, data pipelines, and python scripting.",
      skills: ["python", "sql"],
      years_experience: 2.0,
      required_years: 3.0
    },
    {
      id: "cand_03",
      name: "Jordan Taylor",
      resume_text: "Senior developer expert in Python, FastAPI, React, and SQL database optimization with 5 years experience.",
      skills: ["python", "fastapi", "react", "sql"],
      years_experience: 5.0,
      required_years: 3.0
    }
  ];

  const handleEvaluate = async () => {
    setLoading(true);
    setOutreachStatus('');
    try {
      const skillsArray = requiredSkills.split(',').map(s => s.trim());
      const response = await axios.post(`${API_BASE_URL}/evaluate`, {
        job_title: jobTitle,
        required_skills: skillsArray,
        candidates: sampleCandidates,
        top_k: 3
      });
      setRankedData(response.data.data);
    } catch (err) {
      console.error(err);
      alert('Failed to connect to Node.js backend. Is it running on port 5001?');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectCandidate = (id) => {
    setSelectedCandidates(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleTriggerOutreach = async (channel) => {
    if (selectedCandidates.length === 0) return;
    try {
      const response = await axios.post(`${API_BASE_URL}/outreach`, {
        candidateIds: selectedCandidates,
        channel: channel
      });
      setOutreachStatus(response.data.message);
    } catch (err) {
      console.error(err);
      alert('Failed to trigger outreach queue.');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', fontFamily: 'sans-serif', padding: '20px', background: '#f9fafb', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <header style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '15px', marginBottom: '25px' }}>
        <h1 style={{ color: '#111827', margin: 0, fontSize: '24px' }}>⚡ TalentPipeline Engine</h1>
        <p style={{ color: '#6b7280', margin: '5px 0 0 0', fontSize: '14px' }}>Automated Sourcing, Algorithmic Evaluation & Outreach Orchestration</p>
      </header>

      {/* Job Configuration Panel */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #e5e7eb' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#374151' }}>Job Requisition & Criteria</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', color: '#4b5563' }}>Job Title</label>
            <input 
              type="text" 
              value={jobTitle} 
              onChange={(e) => setJobTitle(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', color: '#4b5563' }}>Required Skills (comma-separated)</label>
            <input 
              type="text" 
              value={requiredSkills} 
              onChange={(e) => setRequiredSkills(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
            />
          </div>
        </div>
        <button 
          onClick={handleEvaluate}
          disabled={loading}
          style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {loading ? 'Evaluating via Python Engine...' : 'Run Sourcing & Scoring'}
        </button>
      </div>

      {/* Leaderboard Results */}
      {rankedData && (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#374151' }}>2. Ranked Candidate Leaderboard ({rankedData.ranked_candidates.length} Matches)</h3>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb', color: '#6b7280' }}>
                <th style={{ padding: '10px' }}>Select</th>
                <th style={{ padding: '10px' }}>Rank</th>
                <th style={{ padding: '10px' }}>Candidate Name</th>
                <th style={{ padding: '10px' }}>Match Score</th>
                <th style={{ padding: '10px' }}>Experience</th>
              </tr>
            </thead>
            <tbody>
              {rankedData.ranked_candidates.map((item, index) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedCandidates.includes(item.id)}
                      onChange={() => toggleSelectCandidate(item.id)}
                    />
                  </td>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>#{index + 1}</td>
                  <td style={{ padding: '10px', color: '#111827', fontWeight: '500' }}>{item.name}</td>
                  <td style={{ padding: '10px', color: '#059669', fontWeight: 'bold' }}>{item.score}%</td>
                  <td style={{ padding: '10px', color: '#4b5563' }}>{item.candidate.years_experience} yrs</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Outreach Actions */}
          <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button 
              onClick={() => handleTriggerOutreach('email')}
              disabled={selectedCandidates.length === 0}
              style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: selectedCandidates.length === 0 ? 'not-allowed' : 'pointer', opacity: selectedCandidates.length === 0 ? 0.6 : 1 }}
            >
              Trigger Email Outreach ({selectedCandidates.length})
            </button>
            <button 
              onClick={() => handleTriggerOutreach('sms')}
              disabled={selectedCandidates.length === 0}
              style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: selectedCandidates.length === 0 ? 'not-allowed' : 'pointer', opacity: selectedCandidates.length === 0 ? 0.6 : 1 }}
            >
              Trigger SMS Outreach ({selectedCandidates.length})
            </button>
            {outreachStatus && <span style={{ fontSize: '13px', color: '#059669', fontWeight: '500' }}>{outreachStatus}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;