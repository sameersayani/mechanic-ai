from fastapi import APIRouter
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")

router = APIRouter(prefix="/ai", tags=["AI"])

client = OpenAI(api_key=api_key)
DEFAULT_CURRENCY = "AUD"

@router.post("/diagnose")
def diagnose(data: dict):
    issue = data.get("issue")

    currency = data.get("currency", DEFAULT_CURRENCY)

    prompt = f"""
    You are an expert car mechanic.

    Diagnose the issue: {issue}

    Provide:
    1. Possible causes
    2. Estimated cost in {currency}
    3. Simple explanation for customer
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # fast + cheap
            messages=[
                {"role": "system", "content": "You are a helpful car mechanic expert."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )

        result = response.choices[0].message.content

        return {"result": result}

    except Exception as e:
        return {"error": str(e)}