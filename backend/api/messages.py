import os
import africastalking
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from api.organisation.routes import get_current_user

load_dotenv()

router = APIRouter(prefix="/messages", tags=["messages"])

class UploadNotificationRequest(BaseModel):
    filename: str


def send_upload_notification(phone: str, organisation_name: str, filename: str) -> None:
    username = os.getenv("AT_USERNAME")
    api_key = os.getenv("AT_API_KEY")
    if not username or not api_key:
        raise RuntimeError("SMS provider is not configured")

    africastalking.initialize(username=username, api_key=api_key)
    message = f"A new document, {filename}, was uploaded by {organisation_name}."
    africastalking.SMS.send(message, [phone])


@router.post("/upload-notification")
def send_upload_notification_route(
    data: UploadNotificationRequest,
    user=Depends(get_current_user),
):
    organisation = user.organisation
    if organisation is None:
        raise HTTPException(status_code=403, detail="An organization is required to send upload notifications")

    try:
        send_upload_notification(organisation.phone, organisation.name, data.filename)
    except Exception as error:
        raise HTTPException(status_code=502, detail="SMS notification could not be sent") from error

    return {"status": "sent"}