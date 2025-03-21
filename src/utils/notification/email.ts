import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
// Create a transporter with connection pooling and rate limiting
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify transporter connection once at the start
transporter.verify((error, success) => {
  if (error) {
    console.error("Error verifying transporter:", error);
  } else {
    console.log("Transporter verified and ready to send emails.");
  }
});

/**
 * Send an email.
 * @param to - Recipient's email
 * @param subject - Email subject
 * @param text - Plain text content
 * @param html - Optional HTML content
 */
const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html?: string
) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      ...(html && { html }), // Add HTML content if provided
    };

    console.log(`Sending email to ${to} with subject "${subject}"`);
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export { sendEmail };
