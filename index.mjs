import { Resend } from "resend"

// CommonJS modules can always be imported via the default export (to prevent errors)
// import autodetailingEmailTemplatesModule from './dist/const/autodetailing.js';
// const { autodetailingEmailTemplates } = autodetailingEmailTemplatesModule;

import roofingEmailTemplatesModule from './dist/const/roofing.js';
const { roofingEmailTemplates } = roofingEmailTemplatesModule;

import decryptResendModule from './dist/utils/decryptResend.js';
const { decryptResend } = decryptResendModule;


// render email using this function because you need each time render email async on client (on server .tsx not avaiable)
// DO NOT INSERT NEW LINES HERE - it may casuse unexpected output (its better to don't change this function - you may do it but do some backup before)
function renderedEmailString(body) {
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<table>
  <tbody>
    <tr>
      <td>
        <p style="white-space: pre-wrap; word-break: break-word; margin: 0 0 8px 0;">${body.trim()}</p>
      </td>
    </tr>
  </tbody>
</table>`;
}




export const handler = async (event) => {

  const { emailFrom, encryptedResend } = event;



  if (!process.env.SEND_EMAILS_TO) {
      return {
        statusCode: 400,
      body: JSON.stringify({ error: `no SEND_EMAILS_TO - check your envs in AWS Lambda receiveEmails Configuration Environment variables` }),
      };
  }
  if (!encryptedResend) {
      return {
        statusCode: 400,
      body: JSON.stringify({ error: `no encryptedResend - check your payload (event target) in recurring schedule` }),
      };
    }
  if (!emailFrom) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `no EMAIL_FROM - check your payload (event target) in recurring schedule` }),
      };
    }

    const decypredResend = await decryptResend(encryptedResend)
  

    
    // 1. Create resend SDK
    const resend = new Resend(decypredResend.value);
    
    // Choose a random email template
    const randomTemplate = roofingEmailTemplates[Math.floor(Math.random() * roofingEmailTemplates.length)];

    // Construct the email
    const email = {
        from: emailFrom,
        to: process.env.SEND_EMAILS_TO,
        subject: randomTemplate.subject,
        html: renderedEmailString(randomTemplate.body)
    };

    const { error } = await resend.emails.send(email);

    if (error) {
      return {
          statusCode: 400,
          body: JSON.stringify({ error: `error sending email - ${error.message || JSON.stringify(error)}` }),
      };
    }
      

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Email sent for warm up` }),
    };

};
