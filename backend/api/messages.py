import os
import africastalking
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

load_dotenv()

africastalking.initialize(
    username=os.getenv("AT_USERNAME"),
    api_key=os.getenv("AT_API_KEY"),
)
sms = africastalking.SMS

app = FastAPI()


class SMSRequest(BaseModel):
    recipients: list[str]  # e.g. ["+254712345678"]
    message: str


@app.post("/send-sms")
def send_sms(data: SMSRequest):
    try:
        response = sms.send(data.message, data.recipients)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))