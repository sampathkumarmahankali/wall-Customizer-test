const { sgMail, emailConfig, emailTemplates } = require('../config/email-config');
const crypto = require('crypto');
const pool = require('../db');

class EmailService {
  constructor() {
    this.sgMail = sgMail;
    this.config = emailConfig;
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(userEmail, userName) {
    // Check if welcome emails are enabled
    const [settings] = await pool.execute('SELECT welcome_email_enabled FROM email_settings LIMIT 1');
    if (!settings.length || !settings[0].welcome_email_enabled) {
      console.log('Welcome email sending is disabled by admin.');
      return { success: false, message: 'Welcome email disabled by admin' };
    }
    try {
      const template = emailTemplates.welcome(userName);
      
      const msg = {
        to: userEmail,
        from: this.config.from.email,
        subject: template.subject,
        html: template.html
      };

      const response = await this.sgMail.send(msg);
      console.log('Welcome email sent successfully:', response[0].statusCode);
      return { success: true, messageId: response[0].headers['x-message-id'] };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(userEmail, userName, resetToken) {
    try {
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      const template = emailTemplates.passwordReset(resetLink, userName);
      
      const msg = {
        to: userEmail,
        from: this.config.from.email,
        subject: template.subject,
        html: template.html
      };

      const response = await this.sgMail.send(msg);
      console.log('Password reset email sent successfully:', response[0].statusCode);
      return { success: true, messageId: response[0].headers['x-message-id'] };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  /**
   * Send activity alert email
   */
  async sendActivityAlert(userEmail, userName, activityType, activityDetails) {
    // Check if activity alert emails are enabled
    const [settings] = await pool.execute('SELECT activity_alert_enabled FROM email_settings LIMIT 1');
    if (!settings.length || !settings[0].activity_alert_enabled) {
      console.log('Activity alert email sending is disabled by admin.');
      return { success: false, message: 'Activity alert email disabled by admin' };
    }
    try {
      const template = emailTemplates.activityAlert(userName, activityType, activityDetails);
      
      const msg = {
        to: userEmail,
        from: this.config.from.email,
        subject: template.subject,
        html: template.html
      };

      const response = await this.sgMail.send(msg);
      console.log('Activity alert email sent successfully:', response[0].statusCode);
      return { success: true, messageId: response[0].headers['x-message-id'] };
    } catch (error) {
      console.error('Error sending activity alert email:', error);
      throw error;
    }
  }

  /**
   * Send newsletter email
   */
  async sendNewsletter(userEmail, userName, newsletterContent) {
    try {
      const template = emailTemplates.newsletter(userName, newsletterContent);
      const msg = {
        to: userEmail,
        from: this.config.from.email,
        subject: template.subject,
        html: template.html
      };

      const response = await this.sgMail.send(msg);
      console.log('Newsletter email sent successfully:', response[0].statusCode);
      return { success: true, messageId: response[0].headers['x-message-id'] };
    } catch (error) {
      console.error('Error sending newsletter email:', error);
      throw error;
    }
  }

  /**
   * Send bulk newsletter to multiple users
   */
  async sendBulkNewsletter(users, newsletterContent) {
    try {
      const messages = users.map(user => {
        const template = emailTemplates.newsletter(user.name || user.email, newsletterContent);
        return {
          to: user.email,
          from: this.config.from.email,
          subject: template.subject,
          html: template.html
        };
      });

      const response = await this.sgMail.sendMultiple(messages);
      console.log('Bulk newsletter sent successfully:', response[0].statusCode);
      return { success: true, count: messages.length };
    } catch (error) {
      console.error('Error sending bulk newsletter:', error);
      throw error;
    }
  }

  /**
   * Generate password reset token
   */
  generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Send custom email with template
   */
  async sendCustomEmail(userEmail, subject, htmlContent) {
    try {
      const msg = {
        to: userEmail,
        from: this.config.from.email,
        subject: subject,
        html: htmlContent
      };

      const response = await this.sgMail.send(msg);
      console.log('Custom email sent successfully:', response[0].statusCode);
      return { success: true, messageId: response[0].headers['x-message-id'] };
    } catch (error) {
      console.error('Error sending custom email:', error);
      throw error;
    }
  }

  /**
   * Send email using SendGrid template
   */
  async sendTemplateEmail(userEmail, templateId, dynamicTemplateData) {
    try {
      const msg = {
        to: userEmail,
        from: this.config.from.email,
        templateId: templateId,
        dynamicTemplateData: dynamicTemplateData
      };

      const response = await this.sgMail.send(msg);
      console.log('Template email sent successfully:', response[0].statusCode);
      return { success: true, messageId: response[0].headers['x-message-id'] };
    } catch (error) {
      console.error('Error sending template email:', error);
      throw error;
    }
  }

  /**
   * Send email verification code
   */
  async sendVerificationCode(userEmail, userName, code) {
    try {
      const template = emailTemplates.verificationCode(userName, code);
      const msg = {
        to: userEmail,
        from: this.config.from.email,
        subject: template.subject,
        html: template.html
      };
      const response = await this.sgMail.send(msg);
      console.log('Verification code email sent successfully:', response[0].statusCode);
      return { success: true, messageId: response[0].headers['x-message-id'] };
    } catch (error) {
      console.error('Error sending verification code email:', error);
      throw error;
    }
  }
}

module.exports = new EmailService(); 