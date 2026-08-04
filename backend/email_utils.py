import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

def send_password_reset_email(to_email: str, reset_link: str, user_name: str):
    """
    Send password reset email to user
    """
    try:
        # Get email configuration from .env
        smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
        smtp_port = int(os.getenv('SMTP_PORT', 465))
        smtp_user = os.getenv('SMTP_USER')
        smtp_password = os.getenv('SMTP_PASSWORD')
        from_email = os.getenv('SMTP_FROM', smtp_user)
        
        print(f"📧 Attempting to send email to: {to_email}")
        print(f"📧 Using SMTP server: {smtp_host}:{smtp_port}")
        
        # Create email
        msg = MIMEMultipart('alternative')
        msg['Subject'] = 'MyeloCare - Password Reset Request'
        msg['From'] = from_email
        msg['To'] = to_email
        
        # Plain text version
        text = f"""
Hello {user_name},

We received a request to reset your password for your MyeloCare account.

Click the link below to reset your password:
{reset_link}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Best regards,
MyeloCare Team
"""
        
        # HTML version (looks professional)
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ padding: 30px; background: #f9f9f9; }}
        .button {{ display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
        .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #999; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 MyeloCare</h1>
            <p>Multiple Myeloma Diagnosis System</p>
        </div>
        <div class="content">
            <h2>Hello {user_name},</h2>
            <p>We received a request to reset your password for your MyeloCare account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center;">
                <a href="{reset_link}" class="button" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    🔑 Reset Password
                </a>
            </div>
            <p style="margin-top: 20px;">Or copy this link into your browser:</p>
            <p><code style="background: #eee; padding: 10px; display: block; word-break: break-all;">{reset_link}</code></p>
            <p><strong>⚠️ This link will expire in 1 hour.</strong></p>
            <p>If you didn't request this, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>© 2024 MyeloCare. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
        </div>
    </div>
</body>
</html>
"""
        
        # Attach both versions
        part1 = MIMEText(text, 'plain')
        part2 = MIMEText(html, 'html')
        msg.attach(part1)
        msg.attach(part2)
        
        # Send email using SSL
        with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
            server.login(smtp_user, smtp_password)
            server.sendmail(from_email, to_email, msg.as_string())
        
        print(f"✅ Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send email: {str(e)}")
        return False