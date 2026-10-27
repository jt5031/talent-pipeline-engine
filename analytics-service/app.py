from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any
import heapq
import re

app = FastAPI(title="TalentPipeline Analytics Service", version="1.0.0")

# --- Scorer Implementation ---
class CandidateScorer:
    def __init__(self, required_skills: List[str]):
        self.required_skills = set(s.lower() for s in required_skills)

    def extract_skills(self, text: str) -> set:
        words = set(re.findall(r'\b\w+\b', text.lower()))
        return words.intersection(self.required_skills)

    def calculate_score(self, candidate: Dict[str, Any]) -> float:
        text = (candidate.get("resume_text", "") + " " + " ".join(candidate.get("skills", []))).lower()
        matched_skills = self.extract_skills(text)
        
        # 1. Skill Match Ratio (60% weight)
        skill_score = (len(matched_skills) / len(self.required_skills)) if self.required_skills else 0.0
        
        # 2. Experience Match (40% weight)
        req_exp = candidate.get("required_years", 3)
        cand_exp = candidate.get("years_experience", 0)
        exp_score = min(cand_exp / req_exp, 1.2) if req_exp > 0 else 1.0

        total_score = round((skill_score * 0.6 + exp_score * 0.4) * 100, 2)
        return total_score

    def rank_candidates(self, candidates: List[Dict[str, Any]], top_k: int = 5) -> List[Dict[str, Any]]:
        if not candidates:
            return []
            
        heap = []
        for cand in candidates:
            score = self.calculate_score(cand)
            cand_entry = {"id": cand.get("id"), "name": cand.get("name"), "score": score, "candidate": cand}
            
            if len(heap) < top_k:
                heapq.heappush(heap, (score, cand.get("id", ""), cand_entry))
            else:
                if score > heap[0][0]:
                    heapq.heappushpop(heap, (score, cand.get("id", ""), cand_entry))
        
        ranked = [item[2] for item in heap]
        ranked.sort(key=lambda x: x["score"], reverse=True)
        return ranked

# --- Pydantic Models ---
class CandidateModel(BaseModel):
    id: str
    name: str
    resume_text: str
    skills: List[str]
    years_experience: float
    required_years: float = 3.0

class RankPayload(BaseModel):
    job_title: str
    required_skills: List[str]
    candidates: List[CandidateModel]
    top_k: int = Field(default=5, ge=1, le=100)

# --- Endpoints ---
@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "analytics-core"}

@app.post("/api/v1/rank-candidates")
def rank_candidates_endpoint(payload: RankPayload):
    try:
        scorer = CandidateScorer(required_skills=payload.required_skills)
        candidates_dict = [c.model_dump() for c in payload.candidates]
        ranked_results = scorer.rank_candidates(candidates_dict, top_k=payload.top_k)
        
        return {
            "job_title": payload.job_title,
            "total_evaluated": len(payload.candidates),
            "ranked_candidates": ranked_results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))