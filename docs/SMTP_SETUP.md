# IEPSL SMTP Setup

The application sends welcome, approval, rejection, account activation, password reset, payment confirmation, payment verification, and renewal reminder emails.

## Gmail setup

Use a dedicated IEPSL Google account rather than a developer's personal account.

1. Sign in to the Google account that will send IEPSL emails.
2. Open **Google Account > Security** and enable **2-Step Verification**.
3. Open **App passwords** and create an app password named `IEPSL Portal`.
4. Copy the generated 16-character app password and remove any spaces when placing it in `.env`. Do not use the normal Google account password.
5. Update `config/.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=membership@iepsl.lk
EMAIL_PASSWORD=the-generated-app-password
EMAIL_FROM_NAME=IEPSL
```

6. Restart the backend after changing `.env`.
7. From the `config` directory, send a test message:

```powershell
npm run email:test -- your-test-address@example.com
```

A successful test prints `connected` and the generated email message ID. Check the inbox and spam folder.

## Production notes

- Never commit `config/.env` or share the app password.
- Add the same email variables to the deployed backend environment.
- If Google Workspace blocks app passwords, the Workspace administrator must allow them or provide an SMTP relay account.
- For higher email volume and delivery reporting, use a transactional provider such as Amazon SES, Postmark, SendGrid, or Mailgun instead of Gmail.
- SMTP credentials belong only on the backend. Do not add them to frontend `VITE_` variables.
