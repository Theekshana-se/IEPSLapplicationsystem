const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        throw new Error('Email service is not configured. Set EMAIL_HOST, EMAIL_USER, and EMAIL_PASSWORD.');
    }

    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: String(process.env.EMAIL_PORT) === '465',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

// Send email
const sendEmail = async (options) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `IEPSL <${process.env.EMAIL_USER}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

// Email templates
const emailTemplates = {
    // Welcome email after registration
    welcome: (memberName, email) => ({
        subject: 'Welcome to IEPSL - Registration Received',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #008080;">Welcome to IEPSL!</h2>
        <p>Dear ${memberName},</p>
        <p>Thank you for registering with the Institute of Environmental Professionals Sri Lanka (IEPSL).</p>
        <p>Your registration has been received and is currently under review by our team.</p>
        <p>You will receive an email notification once your application has been processed.</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <br>
        <p>Best regards,<br>IEPSL Team</p>
      </div>
    `
    }),

    // Application approved
    approved: (memberName, membershipId) => ({
        subject: 'IEPSL Membership Approved',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Congratulations! Your Membership is Approved</h2>
        <p>Dear ${memberName},</p>
        <p>We are pleased to inform you that your IEPSL membership application has been approved!</p>
        <p><strong>Your Membership ID:</strong> ${membershipId}</p>
        <p>You can now access all member benefits and services.</p>
        <p>Login to your account to view your membership card and profile.</p>
        <br>
        <p>Best regards,<br>IEPSL Team</p>
      </div>
    `
    }),

    // Application rejected
    rejected: (memberName, reason) => ({
        subject: 'IEPSL Membership Application Update',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">Membership Application Status</h2>
        <p>Dear ${memberName},</p>
        <p>Thank you for your interest in IEPSL membership.</p>
        <p>After careful review, we regret to inform you that your application could not be approved at this time.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>If you have any questions or would like to reapply, please contact us.</p>
        <br>
        <p>Best regards,<br>IEPSL Team</p>
      </div>
    `
    }),

    // Payment received
    paymentReceived: (memberName, amount, receiptNumber) => ({
        subject: 'Payment Received - IEPSL',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #008080;">Payment Received</h2>
        <p>Dear ${memberName},</p>
        <p>We have received your payment of <strong>LKR ${amount}</strong>.</p>
        <p><strong>Receipt Number:</strong> ${receiptNumber}</p>
        <p>Your payment is being verified and will be confirmed shortly.</p>
        <br>
        <p>Best regards,<br>IEPSL Team</p>
      </div>
    `
    }),

    paymentVerified: (memberName, amount, paymentYear) => ({
        subject: 'IEPSL Payment Verified',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Payment Verified</h2>
        <p>Dear ${memberName},</p>
        <p>Your payment of <strong>LKR ${amount}</strong> has been verified successfully.</p>
        ${paymentYear ? `<p><strong>Membership year:</strong> ${paymentYear}</p>` : ''}
        <p>Thank you for keeping your membership in good standing.</p>
        <br>
        <p>Best regards,<br>IEPSL Team</p>
      </div>
    `
    }),

    renewalReminder: (memberName, year) => ({
        subject: `IEPSL Annual Membership Renewal Reminder for ${year}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Membership Renewal Reminder</h2>
        <p>Dear ${memberName},</p>
        <p>This is a reminder that your IEPSL annual membership payment for <strong>${year}</strong> is still pending.</p>
        <p>Please complete the renewal payment and share your payment proof with the IEPSL administration team.</p>
        <br>
        <p>Best regards,<br>IEPSL Team</p>
      </div>
    `
    }),

    accountActivation: (memberName, activationUrl) => ({
        subject: 'Activate Your IEPSL Member Account',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #008080;">Activate Your IEPSL Account</h2>
        <p>Dear ${memberName},</p>
        <p>Your IEPSL member account is ready. Please set your password using the secure link below.</p>
        <p><a href="${activationUrl}" style="display: inline-block; background: #008080; color: #ffffff; padding: 12px 18px; text-decoration: none; border-radius: 6px;">Set Password</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If the button does not work, open this link in your browser:</p>
        <p style="word-break: break-all;">${activationUrl}</p>
        <br>
        <p>Best regards,<br>IEPSL Team</p>
      </div>
    `
    }),

    passwordReset: (memberName, resetUrl) => ({
        subject: 'Reset Your IEPSL Password',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #008080;">Reset Your IEPSL Password</h2>
        <p>Dear ${memberName},</p>
        <p>We received a request to reset your IEPSL account password.</p>
        <p><a href="${resetUrl}" style="display: inline-block; background: #008080; color: #ffffff; padding: 12px 18px; text-decoration: none; border-radius: 6px;">Reset Password</a></p>
        <p>This link will expire in 24 hours. If you did not request this, you can ignore this email.</p>
        <p>If the button does not work, open this link in your browser:</p>
        <p style="word-break: break-all;">${resetUrl}</p>
        <br>
        <p>Best regards,<br>IEPSL Team</p>
      </div>
    `
    })
};

// Send specific email types
exports.sendWelcomeEmail = async (to, memberName) => {
    const template = emailTemplates.welcome(memberName);
    return await sendEmail({ to, ...template });
};

exports.sendApprovalEmail = async (to, memberName, membershipId) => {
    const template = emailTemplates.approved(memberName, membershipId);
    return await sendEmail({ to, ...template });
};

exports.sendRejectionEmail = async (to, memberName, reason) => {
    const template = emailTemplates.rejected(memberName, reason);
    return await sendEmail({ to, ...template });
};

exports.sendPaymentReceivedEmail = async (to, memberName, amount, receiptNumber) => {
    const template = emailTemplates.paymentReceived(memberName, amount, receiptNumber);
    return await sendEmail({ to, ...template });
};

exports.sendPaymentVerifiedEmail = async (to, memberName, amount, paymentYear) => {
    const template = emailTemplates.paymentVerified(memberName, amount, paymentYear);
    return await sendEmail({ to, ...template });
};

exports.sendRenewalReminderEmail = async (to, memberName, year) => {
    const template = emailTemplates.renewalReminder(memberName, year);
    return await sendEmail({ to, ...template });
};

exports.sendAccountActivationEmail = async (to, memberName, activationUrl) => {
    const template = emailTemplates.accountActivation(memberName, activationUrl);
    return await sendEmail({ to, ...template });
};

exports.sendPasswordResetEmail = async (to, memberName, resetUrl) => {
    const template = emailTemplates.passwordReset(memberName, resetUrl);
    return await sendEmail({ to, ...template });
};

exports.sendEmail = sendEmail;
