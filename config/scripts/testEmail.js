require('../config/env');

const { sendEmail, verifyEmailConnection } = require('../utils/emailService');

function getArgument(name) {
    const index = process.argv.indexOf(name);
    return index >= 0 ? process.argv[index + 1] : '';
}

async function main() {
    const recipient = getArgument('--to') || process.argv.slice(2).find((argument) => !argument.startsWith('--'));

    if (!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
        throw new Error('Usage: npm run email:test -- recipient@example.com');
    }

    process.stdout.write('Checking SMTP connection... ');
    await verifyEmailConnection();
    process.stdout.write('connected.\nSending test email... ');

    const info = await sendEmail({
        to: recipient,
        subject: 'IEPSL Email Configuration Test',
        text: 'Your IEPSL SMTP configuration is working correctly.',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #0b6b67;">IEPSL Email Test Successful</h2>
                <p>Your IEPSL membership portal is connected to the configured email service.</p>
                <p>This message confirms that SMTP authentication and outgoing email delivery are working.</p>
            </div>
        `
    });

    process.stdout.write(`sent (${info.messageId}).\n`);
}

main().catch((error) => {
    console.error(`Email test failed: ${error.message}`);
    process.exitCode = 1;
});
