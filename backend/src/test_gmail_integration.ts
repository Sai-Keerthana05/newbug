import { sendGmailOAuthEmail, sendReportEmail } from './services/emailService';

async function testGmailIntegration() {
  console.log('==================================================');
  console.log('BUG REPLIER: GMAIL OAUTH 2.0 INTEGRATION TEST');
  console.log('==================================================\n');

  const sampleReport = {
    toEmail: 'developer@example.com',
    userGmail: 'testuser@gmail.com',
    accessToken: 'dev_mock_access_token',
    refreshToken: 'dev_mock_refresh_token',
    originalCode: `def divide(a, b):\n    return a / b\nprint(divide(10, 0))`,
    correctedCode: `def divide(a, b):\n    if b == 0:\n        return "Zero division error: denominator cannot be zero"\n    return a / b\nprint(divide(10, 0))`,
    language: 'python',
    bugTitle: 'ZeroDivisionError in Division Function',
    errorType: 'Runtime Error',
    errorSummary: 'ZeroDivisionError: division by zero',
    rootCause: 'Attempted to divide integer 10 by integer 0 without guard clause.',
    explanation: 'Added guard condition checking if denominator b is zero before executing division.',
    changesMade: [
      'Added "if b == 0" safety check',
      'Returned informative error message rather than crashing'
    ],
    verificationStatus: 'Syntax Validated (Python Bytecode Check)',
    preventionTips: [
      'Always validate numerical inputs prior to arithmetic division',
      'Use unit tests with edge-case zero inputs'
    ]
  };

  // Test 1: Test Gmail OAuth Send
  console.log('Test 1: Testing sendGmailOAuthEmail (Google OAuth 2.0 Provider)...');
  try {
    const gmailResult = await sendGmailOAuthEmail(sampleReport);
    console.log('  Gmail Send Result:', gmailResult);
    if (gmailResult.success) {
      console.log('  [PASSED] Gmail OAuth 2.0 Email Engine successfully dispatched message.\n');
    } else {
      console.error('  [FAILED] Gmail send failed.');
      process.exit(1);
    }
  } catch (err: any) {
    console.error('  [FAILED] Gmail exception:', err.message);
    process.exit(1);
  }

  // Test 2: Test Standard SMTP Send (Preserve existing functionality)
  console.log('Test 2: Testing sendReportEmail (Platform SMTP Provider)...');
  try {
    const smtpResult = await sendReportEmail(sampleReport);
    console.log('  SMTP Send Result:', smtpResult);
    if (smtpResult) {
      console.log('  [PASSED] Existing Platform SMTP engine preserved and functioning.\n');
    } else {
      console.error('  [FAILED] SMTP send failed.');
      process.exit(1);
    }
  } catch (err: any) {
    console.error('  [FAILED] SMTP exception:', err.message);
    process.exit(1);
  }

  console.log('ALL EMAIL PROVIDER INTEGRATION TESTS PASSED SUCCESSFULLY!');
}

testGmailIntegration();
