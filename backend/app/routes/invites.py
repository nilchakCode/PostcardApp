"""API routes for friend invites."""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from app.utils.auth import get_current_user
from app.utils.email import send_invite_email
from app.database import supabase
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


class InviteRequest(BaseModel):
    """Request model for sending an invite."""
    email: EmailStr


class InviteResponse(BaseModel):
    """Response model for invite."""
    success: bool
    message: str


@router.post("/send", response_model=InviteResponse)
async def send_invite(
    invite: InviteRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Send an invite email to a friend.

    Args:
        invite: Email address to send invite to
        current_user: Currently authenticated user

    Returns:
        Success status and message
    """
    try:
        # Get current user's profile to get their name
        user_profile = supabase.table("users").select("first_name, last_name, username").eq("id", current_user["id"]).execute()

        if not user_profile.data or len(user_profile.data) == 0:
            from_name = "A friend"
        else:
            profile = user_profile.data[0]
            if profile.get("first_name") and profile.get("last_name"):
                from_name = f"{profile['first_name']} {profile['last_name']}"
            elif profile.get("first_name"):
                from_name = profile["first_name"]
            elif profile.get("username"):
                from_name = profile["username"]
            else:
                from_name = "A friend"

        # Send the invite email
        success = await send_invite_email(invite.email, from_name)

        if success:
            # Optional: Log the invite in database for tracking
            try:
                supabase.table("friend_invites").insert({
                    "inviter_id": current_user["id"],
                    "invitee_email": invite.email
                }).execute()
            except Exception as e:
                # Don't fail if logging fails
                logger.warning(f"Failed to log invite: {str(e)}")

            return InviteResponse(
                success=True,
                message="Invite sent successfully!"
            )
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to send invite email. Please check email configuration."
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending invite: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send invite: {str(e)}"
        )
