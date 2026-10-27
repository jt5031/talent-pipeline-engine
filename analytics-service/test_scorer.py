import pytest
from app import CandidateScorer

@pytest.fixture
def sample_setup():
    required_skills = ["python", "fastapi", "react", "sql"]
    scorer = CandidateScorer(required_skills)
    return scorer

def test_exact_skill_extraction(sample_setup):
    text = "Experienced software engineer proficient in Python, FastAPI, and SQL databases."
    extracted = sample_setup.extract_skills(text)
    assert extracted == {"python", "fastapi", "sql"}

def test_score_calculation(sample_setup):
    candidate = {
        "id": "c1",
        "name": "Jane Doe",
        "resume_text": "Built web services using Python, FastAPI, and React.",
        "skills": ["python", "fastapi", "react"],
        "years_experience": 3.0,
        "required_years": 3.0
    }
    score = sample_setup.calculate_score(candidate)
    assert score == 85.0

def test_rank_candidates_top_k(sample_setup):
    candidates = [
        {"id": "1", "name": "Alice", "resume_text": "python sql", "skills": ["python", "sql"], "years_experience": 1, "required_years": 3},
        {"id": "2", "name": "Bob", "resume_text": "python fastapi react sql", "skills": ["python", "fastapi", "react", "sql"], "years_experience": 4, "required_years": 3},
        {"id": "3", "name": "Charlie", "resume_text": "react", "skills": ["react"], "years_experience": 2, "required_years": 3},
    ]
    
    ranked = sample_setup.rank_candidates(candidates, top_k=2)
    assert len(ranked) == 2
    assert ranked[0]["id"] == "2"
    assert ranked[0]["score"] > ranked[1]["score"]

def test_empty_candidates(sample_setup):
    ranked = sample_setup.rank_candidates([], top_k=5)
    assert ranked == []