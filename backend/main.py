from fastapi import FastAPI, Form, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from groq import Groq
import os
import io

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

app = FastAPI(title="FinWise AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
        "https://finwise-ai-beige.vercel.app",
        "*"],
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
        import pytesseract
        from PIL import Image

        # Set tesseract path for Windows
        pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

        # Read image
        contents = await file.read()
        img = Image.open(io.BytesIO(contents))

        # Extract text using OCR
        extracted_text = pytesseract.image_to_string(img)

        if not extracted_text.strip():
            extracted_text = "Could not extract text from image clearly"

        print(f"OCR extracted: {extracted_text}")

        # Send extracted text to Groq
        prompt = f"""The user uploaded a payment screenshot.
Here is the text extracted from it via OCR:

{extracted_text}

Please analyze this and provide:
1. Amount paid (look for numbers with Rs, INR, or rupee symbol)
2. Merchant or app name (PhonePe, GPay, Paytm, Amazon, Zomato etc)
3. Date of transaction if visible
4. Expense category (food, transport, shopping, utilities, entertainment)
5. A brief financial tip about this type of spending

User message: {message}

If the OCR text is unclear, make your best guess based on what you can see."""

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
        return {"response": f"Error analyzing screenshot: {str(e)}", "status": "error"}