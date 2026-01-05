"""Email utility for sending invites and notifications."""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings
import logging

logger = logging.getLogger(__name__)


async def send_invite_email(to_email: str, from_user_name: str) -> bool:
    """
    Send an invite email to a friend.

    Args:
        to_email: Email address to send the invite to
        from_user_name: Name of the user sending the invite

    Returns:
        bool: True if email sent successfully, False otherwise
    """
    if not settings.smtp_username or not settings.smtp_password or not settings.smtp_from_email:
        logger.warning("SMTP credentials not configured. Email not sent.")
        return False

    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"{from_user_name} invited you to join POSTCARD!"
        msg['From'] = f"{settings.smtp_from_name} <{settings.smtp_from_email}>"
        msg['To'] = to_email

        # Create the plain text version
        text_content = f"""
Hey there! 👋

{from_user_name} invited you to join POSTCARD - an authentic new social experience where you can share photos, travel stories, poetry, and life experiences without all the engagement farming, fluff, and AI-generated content you see everywhere else.

It's refreshing, real, and actually meaningful. We think you'd love it!

Join us: {settings.frontend_url}/signup

Hope to see you there!

- The POSTCARD Team
        """

        # Create the HTML version
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .header {{
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }}
        .content {{
            background: #ffffff;
            padding: 30px;
            border: 2px solid #000;
            border-top: none;
        }}
        .cta-button {{
            display: inline-block;
            background: #f59e0b;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            margin: 20px 0;
        }}
        .footer {{
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
        }}
        h1 {{
            margin: 0;
            font-size: 28px;
            letter-spacing: 0.05em;
            text-transform: lowercase;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>postcard</h1>
    </div>
    <div class="content">
        <p>Hey there! 👋</p>

        <p><strong>{from_user_name}</strong> invited you to join <strong>POSTCARD</strong> - an authentic new social experience where you can share photos, travel stories, poetry, and life experiences without all the engagement farming, fluff, and AI-generated content you see everywhere else.</p>

        <p>It's refreshing, real, and actually meaningful. We think you'd love it!</p>

        <div style="text-align: center;">
            <a href="{settings.frontend_url}/signup" class="cta-button">Join POSTCARD</a>
        </div>

        <p>Hope to see you there!</p>

        <p style="color: #666; font-size: 14px;">- The POSTCARD Team</p>
    </div>
    <div class="footer">
        <p>This email was sent because {from_user_name} thought you might be interested in POSTCARD.</p>
        <p>POSTCARD - Authentic social experiences, no fluff.</p>
    </div>
</body>
</html>
        """

        # Attach both versions
        part1 = MIMEText(text_content, 'plain')
        part2 = MIMEText(html_content, 'html')
        msg.attach(part1)
        msg.attach(part2)

        # Send email
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_username, settings.smtp_password)
            server.send_message(msg)

        logger.info(f"Invite email sent successfully to {to_email}")
        return True

    except Exception as e:
        logger.error(f"Failed to send invite email to {to_email}: {str(e)}")
        return False
