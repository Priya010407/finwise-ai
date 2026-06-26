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
        filename = file.filename.lower()

        # Guess category from filename
        category = "general expense"
        if any(x in filename for x in ["zomato", "swiggy", "food"]):
            category = "food delivery"
        elif any(x in filename for x in ["uber", "ola", "rapido"]):
            category = "transport"
        elif any(x in filename for x in ["amazon", "flipkart", "shopping"]):
            category = "shopping"
        elif any(x in filename for x in ["phone", "gpay", "paytm", "upi"]):
            category = "UPI payment"
        elif any(x in filename for x in ["netflix", "spotify", "hotstar"]):
            category = "entertainment"

        prompt = f"""The user uploaded a payment screenshot named '{file.filename}'.
This appears to be a {category} transaction.

Please provide:
1. Likely amount range for this type of transaction
2. Merchant category: {category}
3. Expense category for budgeting
4. 2-3 specific financial tips for this type of spending in India
5. How this fits into a monthly budget

User message: {message}

Be specific and helpful even without seeing the exact image."""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            max_tokens=600
        )

        reply = response.choices[0].message.content
        return {"response": reply, "status": "success"}

    except Exception as e:
        return {"response": f"Error: {str(e)}", "status": "error"}