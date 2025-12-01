import nodemailer from 'nodemailer';

/**
 * Send an email using Nodemailer and environment-based SMTP configuration.
 *
 * Transport configuration is derived from environment variables:
 * - If `SMTP_SERVICE` is set to `gmail` (case-insensitive), the built-in
 *   Gmail service is used.
 * - Otherwise, a generic SMTP transport is created using `SMTP_HOST` and
 *   `SMTP_PORT`.
 *
 * Common environment variables:
 * - `SMTP_SERVICE` (optional, e.g. `gmail`)
 * - `SMTP_HOST`, `SMTP_PORT` (for generic SMTP)
 * - `SMTP_USERNAME`, `SMTP_PASSWORD`
 * - `SMTP_FROM_NAME`, `SMTP_FROM_EMAIL`
 *
 * @async
 * @param {Object} options - Email options.
 * @param {string} options.email - Recipient email address.
 * @param {string} options.subject - Email subject line.
 * @param {string} [options.html] - HTML body of the email.
 * @returns {Promise<import('nodemailer').SentMessageInfo>} Result from
 *   `transporter.sendMail`.
 * @throws {Error} If transport creation or sendMail fails.
 */
export const sendEmail = async (options) => {
  try {
    const useGmailService = /gmail/i.test(process.env.SMTP_SERVICE || '');

    const transportConfig = useGmailService
      ? {
          service: 'gmail',
          secure: /production/i.test(process.env.NODE_ENV),
        }
      : {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          secure: /production/i.test(process.env.NODE_ENV),
        };

    const transporter = nodemailer.createTransport({
      ...transportConfig,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const message = {
      from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
      to: options?.email,
      subject: options?.subject,
      html: options?.html,
      // text: options?.message,
    };

    return await transporter.sendMail(message);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(String(error));
  }
};
