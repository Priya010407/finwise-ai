from fastapi import FastAPI, Form, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from groq import Groq
import os
import io
import base64

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

app = FastAPI(title="FinWise AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SYSTEM_PROMPT = """You are FinWise, an expert Indian personal finance advisor.
You help users with:
- Expense tracking and budgeting
- SIP, mutual funds, ELSS, PPF, NPS advice
- Indian tax saving (Section 80C, 80CCD)
- Warren Buffett and Robert Kiyosaki principles
- UPI payment analysis
Always use rupee symbol for amounts. Be concise, friendly and actionable.
Always add disclaimer: Consult a SEBI-registered advisor for investments."""


@app.get("/health")
def health():
    return {"status": "FinWise is running 🚀"}


@app.post("/chat")
async def chat(message: str = Form(...)):
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": message}
            ],
            max_tokens=500
        )
        reply = response.choices[0].message.content
        return {"response": reply, "status": "success"}
    except Exception as e:
        return {"response": f"Error: {str(e)}", "status": "error"}


@app.post("/analyze-screenshot")
async def analyze_screenshot(
    file: UploadFile = File(...),
    message: str = Form(default="Analyze this payment screenshot")
):
    try:
        contents = await file.read()
        
        # Convert image to base64
        base64_image = base64.b64encode(contents).decode("utf-8")
        
        # Detect image type
        content_type = file.content_type or "image/jpeg"
        
        # Use Groq Vision model to analyze image
        vision_response = client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{content_type};base64,{base64_image}"
                            }
                        },
                        {
                            "type": "text",
                            "text": f"""You are analyzing an Indian payment screenshot.

Please extract and provide:
1. Amount: Exact amount paid in rupees
2. Merchant: Name of merchant or app
3. Date: Transaction date if visible
4. Payment method: UPI, credit card, debit card etc
5. Category: Food/Transport/Shopping/Utilities/Entertainment/Investment

User message: {message}

Be specific with exact amount and merchant name visible in the image."""
                        }
                    ]
                }
            ],
            max_tokens=500
        )
        
        extracted_info = vision_response.choices[0].message.content
        
        # Get financial advice based on extracted info
        advice_response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": f"""Based on this payment analysis:

{extracted_info}

Provide personalized Indian financial advice:
1. Is this spending reasonable?
2. Monthly budget recommendation for this category
3. How to save money with Indian alternatives
4. Investment tip with saved amount (SIP suggestion)"""
                }
            ],
            max_tokens=500
        )
        
        final_reply = f"""📸 Screenshot Analysis:

{extracted_info}

---

💡 Financial Advice:

{advice_response.choices[0].message.content}"""

        return {"response": final_reply, "status": "success"}

    except Exception as e:
        return {"response": f"Error: {str(e)}", "status": "error"}