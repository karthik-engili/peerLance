/**
 * @file sendEmail.js
 * @description Nodemailer helper for sending transactional emails.
 * Used for welcome emails, bid notifications, and review alerts.
 */
import nodemailer from "nodemailer";

const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

/**
 * Send an email using the configured SMTP transport.
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject line
 * @param {string} options.html - HTML email body
 * @returns {Promise} - Nodemailer send result
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"PeerLance" <${smtpUser}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`Email send failed to ${to}:`, err.message);
    // Don't throw — email failure shouldn't crash the request
  }
};

/**
 * Pre-built email templates
 */
export const emailTemplates = {
  welcome: (firstName) => ({
    subject: "Welcome to PeerLance! 🚀",
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #4F46E5;">Welcome to PeerLance, ${firstName}!</h1>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          You've joined a community of students who help each other grow through real freelance work.
        </p>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Whether you're here to post projects or bid on tasks — we're glad to have you.
        </p>
        <p style="color: #6B7280; font-size: 14px; margin-top: 32px;">— The PeerLance Team</p>
      </div>
    `,
  }),

  bidAccepted: (freelancerName, projectTitle) => ({
    subject: `Your bid on "${projectTitle}" was accepted! 🎉`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #059669;">Congratulations, ${freelancerName}!</h1>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Your bid on <strong>"${projectTitle}"</strong> has been accepted by the client.
        </p>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          You can now chat with the client and start working on the project.
        </p>
        <p style="color: #6B7280; font-size: 14px; margin-top: 32px;">— The PeerLance Team</p>
      </div>
    `,
  }),

  bidRejected: (freelancerName, projectTitle) => ({
    subject: `Update on your bid for "${projectTitle}"`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #DC2626;">Bid Update</h1>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Hi ${freelancerName}, unfortunately your bid on <strong>"${projectTitle}"</strong> was not selected this time.
        </p>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Don't worry — there are plenty more projects waiting for your skills!
        </p>
        <p style="color: #6B7280; font-size: 14px; margin-top: 32px;">— The PeerLance Team</p>
      </div>
    `,
  }),

  newReview: (freelancerName, rating, projectTitle) => ({
    subject: `You received a ${rating}★ review! ⭐`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #F59E0B;">New Review Received!</h1>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Hi ${freelancerName}, you received a <strong>${rating}★</strong> review for
          <strong>"${projectTitle}"</strong>.
        </p>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Keep up the great work — your profile is getting stronger!
        </p>
        <p style="color: #6B7280; font-size: 14px; margin-top: 32px;">— The PeerLance Team</p>
      </div>
    `,
  }),
};
