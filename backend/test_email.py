from email_utils import send_password_reset_email

# Test with your email
send_password_reset_email(
    to_email="ehtishamahmad950@gmail.com",  # CHANGE THIS TO YOUR EMAIL
    reset_link="http://localhost:5173/reset-password?token=test123",
    user_name="Test User"
)
print("Test complete! Check your inbox.")