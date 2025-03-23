"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Create a transporter with connection pooling and rate limiting
const transporter = nodemailer_1.default.createTransport({
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
    }
    else {
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
const sendEmail = (to, subject, text, html) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mailOptions = Object.assign({ from: process.env.EMAIL_USER, to,
            subject,
            text }, (html && { html }));
        console.log(`Sending email to ${to} with subject "${subject}"`);
        const info = yield transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.messageId);
        return true;
    }
    catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
});
exports.sendEmail = sendEmail;
