from fastapi import APIRouter
import requests

router = APIRouter(prefix="/ai", tags=["AI"])

@router.post("/diagnose")
def diagnose(data: dict):
    issue = data.get("issue")

    prompt = f"""
You are an expert car mechanic.

Diagnose the issue: {issue}

Provide:
1. Possible causes
2. Estimated cost in INR
3. Simple explanation
"""

    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3",
                "prompt": prompt,
                "stream": False
            },
            timeout=60
        )

        res_json = response.json()

        result = res_json.get("response", "No response from AI")

        return {"result": result}

    except Exception as e:
        return {"error": str(e)}