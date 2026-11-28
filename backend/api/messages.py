import os
from datetime import datetime

import africastalking
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from api.organisation.routes import get_current_user

load_dotenv()
AT_USERNAME = os.getenv("AT_USERNAME")
AT_API_KEY = os.getenv("AT_API_KEY")

sms = None
if AT_USERNAME and AT_API_KEY:
    africastalking.initialize(username=AT_USERNAME, api_key=AT_API_KEY)
    sms = africastalking.SMS

router = APIRouter(prefix="/messages", tags=["messages"])


class UploadNotificationRequest(BaseModel):
    filename: str | None = None


def build_update_message(organisation_name: str) -> str:
    sent_at = datetime.now().strftime("%d-%m-%Y,%I:%M.%S %p")
    return f"You have an update from {organisation_name}: {sent_at}"


def send_update_notifications(organisation_name: str, phones: list[str]) -> dict:
    if sms is None:
        raise RuntimeError("SMS provider is not configured")

    recipients = list(dict.fromkeys(phone for phone in phones if phone))
    if not recipients:
        return {"status": "no_subscribers", "message": build_update_message(organisation_name)}

    sms.send(build_update_message(organisation_name), recipients)
    return {"status": "sent", "recipients": len(recipients), "message": build_update_message(organisation_name)}


def send_upload_notification(phone: str, organisation_name: str, subscribers: list[str] | None = None) -> dict:
    recipients = subscribers if subscribers is not None else [phone]
    return send_update_notifications(organisation_name, recipients)


@router.post("/notification")
def send_upload_notification_route(
    data: UploadNotificationRequest,
    user=Depends(get_current_user),
):
    organisation = user.organisation
    if organisation is None:
        raise HTTPException(status_code=403, detail="An organization is required to send upload notifications")

    try:
        send_upload_notification(
            organisation.phone,
            organisation.name,
            subscribers=list(organisation.subscribed or []),
        )
    except Exception as error:
        raise HTTPException(status_code=502, detail="SMS notification could not be sent") from error

    return {"status": "sent", "message": build_update_message(organisation.name)}