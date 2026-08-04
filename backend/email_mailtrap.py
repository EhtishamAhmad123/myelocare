import os
import mailtrap as mt
from dotenv import load_dotenv

load_dotenv()

def send_password_reset_email_mailtrap(to_email: str, reset_link: str, user_name: str):
    """
    Send password reset email using Mailtrap
    """
    try:
        api_token = os.getenv('MAILTRAP_API_TOKEN')
        from_email = os.getenv('MAILTRAP_FROM_EMAIL', 'hello@demomailtrap.co')
        from_name = os.getenv('MAILTRAP_FROM_NAME', 'MyeloCare')
        
        if not api_token:
            print("❌ MAILTRAP_API_TOKEN not found in .env file")
            print("📋 Get it from: https://mailtrap.io/home")
            return False
        
        print(f"📧 Sending password reset email to: {to_email}")
        
        # HTML email content
        html_content = f"""
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
        
        # Plain text version
        text_content = f"""
Hello {user_name},

We received a request to reset your password for your MyeloCare account.

Click the link below to reset your password:
{reset_link}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Best regards,
MyeloCare Team
"""
        
        # Create mail object
        mail = mt.Mail(
            sender=mt.Address(email=from_email, name=from_name),
            to=[mt.Address(email=to_email)],
            subject="MyeloCare - Password Reset Request",
            html=html_content,
            text=text_content,
            category="Password Reset",
        )
        
        # Send using Mailtrap client
        client = mt.MailtrapClient(token=api_token)
        response = client.send(mail)
        
        print(f"✅ Password reset email sent to {to_email}")
        print(f"📬 View email at: https://mailtrap.io/inboxes")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send email: {str(e)}")
        return False

# For testing
# For testing
if __name__ == "__main__":
    send_password_reset_email_mailtrap(
        to_email="ehtiahmad1122@gmail.com",  # ✅ Your actual email
        reset_link="http://localhost:5173/reset-password?token=test123",
        user_name="Test User"
    )