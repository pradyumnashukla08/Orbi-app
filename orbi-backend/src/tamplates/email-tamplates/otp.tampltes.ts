export interface OtpTemplateData {
  code: string;
  expiresInMinutes: number;
  purpose: 'signup' | 'password-reset';
}

export const getOtpTemplate = (data: OtpTemplateData) => {
  const { code, expiresInMinutes, purpose } = data;
  
  const isReset = purpose === 'password-reset';
  const title = isReset ? 'Reset Your Password' : 'Verify Your Email';
  const message = isReset 
    ? 'We received a request to reset your ORBI password. Use the code below to proceed.'
    : 'Welcome to ORBI! Use the code below to verify your email address and activate your account.';
  const buttonText = isReset ? 'Reset Password Code' : 'Verification Code';

  const subject = isReset ? 'Reset your ORBI password' : 'Your ORBI verification code - ' + code;

  const html = `
  <!DOCTYPE html>
  <html>
  <body style="margin:0; padding:0; background-color:#f4f5f7;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
            <!-- Header -->
            <tr>
              <td style="background-color:#111827; padding: 28px 32px; text-align:left;">
                <h1 style="margin:0; color:#ffffff; font-family: Inter, Arial, sans-serif; font-size:22px; font-weight:800; letter-spacing:-0.5px;">ORBI</h1>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding: 32px 32px 10px 32px;">
                <h2 style="margin:0 0 12px 0; font-family: Inter, Arial, sans-serif; color:#111827; font-size:20px; font-weight:700;">${title}</h2>
                <p style="margin:0; font-family: Inter, Arial, sans-serif; color:#4b5563; font-size:15px; line-height:24px;">
                  ${message}
                </p>
              </td>
            </tr>
            <!-- OTP Box -->
            <tr>
              <td style="padding: 24px 32px;">
                <p style="margin:0 0 8px 0; font-family: Inter, Arial, sans-serif; color:#6b7280; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:1px;">${buttonText}</p>
                <div style="background-color:#f5f3ff; border: 1px dashed #8b5cf6; border-radius:12px; padding: 16px; text-align:center;">
                  <span style="font-family: monospace, Arial, sans-serif; font-size:36px; font-weight:800; letter-spacing:12px; color:#7c3aed;">${code}</span>
                </div>
                <p style="margin: 16px 0 0 0; font-family: Inter, Arial, sans-serif; color:#6b7280; font-size:13px; text-align:center;">
                  This code will expire in <b style="color:#111827;">${expiresInMinutes} minutes</b>.
                </p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding: 0 32px 32px 32px;">
                <p style="margin: 24px 0 0 0; font-family: Inter, Arial, sans-serif; color:#9ca3af; font-size:12px; line-height:18px; border-top:1px solid #f3f4f6; padding-top:20px;">
                  If you did not request this code, you can safely ignore this email. Someone might have typed your email by mistake.<br><br>
                  © ${new Date().getFullYear()} ORBI. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  const text = `${title}\n\n${message}\n\nYour code is: ${code}\nValid for ${expiresInMinutes} minutes.`;

  return { subject, html, text };
}