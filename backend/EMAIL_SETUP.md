# Email Notification System Setup

This document provides instructions for setting up the SendGrid email notification system for the Wallora application.

## Prerequisites

1. **SendGrid Account**: Sign up for a free SendGrid account at [sendgrid.com](https://sendgrid.com)
2. **Domain Verification**: Verify your domain with SendGrid for better deliverability
3. **API Key**: Generate a SendGrid API key

## Environment Variables

Add the following variables to your `.env` file:

```env
# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key_here
FROM_EMAIL=noreply@yourdomain.com
FRONTEND_URL=http://localhost:3000

# Email Templates (Optional - for SendGrid Dynamic Templates)
SENDGRID_WELCOME_TEMPLATE_ID=d-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_PASSWORD_RESET_TEMPLATE_ID=d-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_NEWSLETTER_TEMPLATE_ID=d-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_ACTIVITY_ALERT_TEMPLATE_ID=d-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Database Setup

Run the migration to add email-related fields:

```sql
-- Execute the migration file
source backend/migrations/add_email_fields.sql;
```

## SendGrid Setup Steps

### 1. Create SendGrid Account
1. Go to [sendgrid.com](https://sendgrid.com)
2. Sign up for a free account (100 emails/day)
3. Verify your email address

### 2. Generate API Key
1. Navigate to Settings → API Keys
2. Click "Create API Key"
3. Choose "Full Access" or "Restricted Access" with "Mail Send" permissions
4. Copy the API key and add it to your `.env` file

### 3. Verify Sender Identity
1. Go to Settings → Sender Authentication
2. Choose either Domain Authentication (recommended) or Single Sender Verification
3. Follow the verification steps

### 4. Create Email Templates (Optional)
1. Go to Marketing → Dynamic Templates
2. Create templates for:
   - Welcome Email
   - Password Reset
   - Activity Alerts
   - Newsletter
3. Copy the template IDs to your `.env` file

## Email Types Supported

### 1. Transactional Emails
- **Welcome Email**: Sent automatically when users register
- **Password Reset**: Sent when users request password reset
- **Account Verification**: Email verification (if implemented)

### 2. Behavioral Alerts
- **Activity Alerts**: Notifications about user activity
- **Security Alerts**: Login attempts, password changes
- **Usage Alerts**: Storage limits, feature usage

### 3. Marketing Emails
- **Newsletter**: Weekly/monthly updates
- **Feature Announcements**: New features and updates
- **Promotional Emails**: Special offers and discounts

## API Endpoints

### Email Routes (`/api/email`)

#### Send Welcome Email
```http
POST /api/email/send-welcome
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe"
}
```

#### Request Password Reset
```http
POST /api/email/request-password-reset
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Reset Password
```http
POST /api/email/reset-password
Content-Type: application/json

{
  "token": "reset_token_here",
  "newPassword": "new_password_here"
}
```

#### Send Activity Alert
```http
POST /api/email/send-activity-alert
Authorization: Bearer <token>
Content-Type: application/json

{
  "activityType": "Design Created",
  "activityDetails": "New wall design 'Modern Living Room' was created"
}
```

#### Send Newsletter (Single User)
```http
POST /api/email/send-newsletter
Authorization: Bearer <token>
Content-Type: application/json

{
  "newsletterContent": "<h3>New Features</h3><p>Check out our latest updates...</p>"
}
```

#### Send Bulk Newsletter (Admin Only)
```http
POST /api/email/send-bulk-newsletter
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "newsletterContent": "<h3>Weekly Update</h3><p>Here's what's new...</p>"
}
```

#### Send Custom Email (Admin Only)
```http
POST /api/email/send-custom-email
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "to": "user@example.com",
  "subject": "Custom Subject",
  "htmlContent": "<h1>Custom Email</h1><p>Content here...</p>"
}
```

#### Test Email Service
```http
POST /api/email/test-email
Content-Type: application/json

{
  "email": "test@example.com",
  "name": "Test User"
}
```

## Testing the Email System

### 1. Test Email Service
```bash
curl -X POST http://localhost:4000/api/email/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com", "name": "Test User"}'
```

### 2. Test Registration (Welcome Email)
Register a new user through the frontend or API to trigger the welcome email.

### 3. Test Password Reset
```bash
curl -X POST http://localhost:4000/api/email/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

## Email Templates

The system includes built-in HTML templates for:
- Welcome emails with Wallora branding
- Password reset emails with security tips
- Activity alert emails with user activity details
- Newsletter emails with customizable content

### Customizing Templates

Edit the templates in `backend/config/email-config.js`:

```javascript
const emailTemplates = {
  welcome: (userName) => ({
    subject: 'Welcome to Wallora! 🎨',
    html: `... your custom HTML ...`
  }),
  // ... other templates
};
```

## Monitoring and Logging

### Email Logs
All email operations are logged to the console:
- Success: `Welcome email sent successfully: 202`
- Errors: `Error sending welcome email: [error details]`

### SendGrid Dashboard
Monitor email delivery, bounces, and engagement through the SendGrid dashboard:
- Activity → Email Activity
- Statistics → Email Statistics

## Best Practices

### 1. Email Deliverability
- Use a verified domain as the sender
- Maintain good sender reputation
- Monitor bounce rates and spam reports
- Use proper authentication (SPF, DKIM, DMARC)

### 2. Template Design
- Use responsive design for mobile devices
- Include clear call-to-action buttons
- Provide unsubscribe links for marketing emails
- Test emails across different email clients

### 3. Security
- Never expose API keys in client-side code
- Validate email addresses before sending
- Rate limit email sending to prevent abuse
- Use HTTPS for all API communications

### 4. Performance
- Send emails asynchronously when possible
- Use bulk sending for newsletters
- Implement email queuing for high-volume sending
- Monitor email service performance

## Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check SendGrid API key
   - Verify sender authentication
   - Check console logs for errors

2. **Emails going to spam**
   - Verify domain with SendGrid
   - Use consistent sender information
   - Avoid spam trigger words

3. **Template not rendering**
   - Check HTML syntax
   - Test with simple content first
   - Verify template variables

### Debug Mode

Enable debug logging by adding to your `.env`:
```env
EMAIL_DEBUG=true
```

This will log detailed information about email operations.

## Support

For SendGrid-specific issues:
- [SendGrid Documentation](https://sendgrid.com/docs/)
- [SendGrid Support](https://support.sendgrid.com/)

For application-specific issues:
- Check the console logs
- Review the email service implementation
- Test with the provided endpoints 