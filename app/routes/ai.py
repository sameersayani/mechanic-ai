from fastapi import APIRouter
import os
import json
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")

router = APIRouter(prefix="/ai", tags=["AI"])


DEFAULT_CURRENCY = "AUD"
DEFAULT_COUNTRY = "Australia"
DEFAULT_VAT = 10.0  # Australia GST 10%


@router.post("/diagnose")
def diagnose(data: dict):
    issue = data.get("issue")
    car = data.get("car", "Unknown Car")
    model = data.get("model", "Unknown Model")
    currency = data.get("currency", DEFAULT_CURRENCY)
    country = data.get("country", DEFAULT_COUNTRY)
    vat_rate = data.get("vat", DEFAULT_VAT)

    prompt = f"""
You are a professional car mechanic and service advisor.

A customer has brought in their car with the following details:
- Car: {car}
- Model: {model}
- Issue Reported: {issue}

Your task is to provide a structured diagnostic report in the following JSON format ONLY.
Do NOT include any extra text, explanation, or markdown. Return raw JSON only.

{{
  "car": "{car}",
  "model": "{model}",
  "issue": "{issue}",
  "solution": {{
    "repair_or_replacement": "Brief description of what repair or replacement is needed",
    "parts_replaced": ["Part 1", "Part 2"],
    "services_done": ["Service 1", "Service 2"]
  }},
  "bill": {{
    "parts_cost": <number>,
    "repair_and_service_cost": <number>,
    "currency": "{currency}"
  }}
}}

Rules:
- parts_cost and repair_and_service_cost must be realistic numeric values in {currency}
- Be specific about parts and services
- Keep descriptions concise and professional
"""

    try:
        # Create client lazily to avoid network/blocking at import time
        client = OpenAI(api_key=api_key)

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a professional car mechanic. Always respond in raw JSON only, no markdown, no extra text."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5
        )

        raw = response.choices[0].message.content.strip()

        # Strip markdown code fences if model adds them
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()

        ai_data = json.loads(raw)

        # Calculate billing
        parts_cost = float(ai_data["bill"]["parts_cost"])
        repair_cost = float(ai_data["bill"]["repair_and_service_cost"])
        overall = parts_cost + repair_cost
        vat_amount = round(overall * vat_rate / 100, 2)
        final = round(overall + vat_amount, 2)

        return {
            "car": ai_data.get("car"),
            "model": ai_data.get("model"),
            "issue": ai_data.get("issue"),
            "solution": {
                "repair_or_replacement": ai_data["solution"]["repair_or_replacement"],
                "parts_replaced": ai_data["solution"]["parts_replaced"],
                "services_done": ai_data["solution"]["services_done"],
            },
            "bill": {
                "parts_cost": parts_cost,
                "repair_and_service_cost": repair_cost,
                "overall_amount": round(overall, 2),
                "vat_rate": vat_rate,
                "vat_amount": vat_amount,
                "final_bill_amount": final,
                "currency": currency,
                "country": country,
            }
        }

    except json.JSONDecodeError as e:
        return {"error": f"Failed to parse AI response: {str(e)}", "raw": raw}
    except Exception as e:
        return {"error": str(e)}