/*
Turnstile token verification utility function
*/

interface TurnstileResponse {
  success: boolean;
  'error-codes'?: string[];
}

interface TurnstileError {
  message: string;
  status: number;
}

export async function verifyTurnstileToken(token: string): Promise<TurnstileResponse | TurnstileError> {
  try {
    
    /* Worker URL for Turnstile verification */
    const workerUrl = 'https://turnstile.stephenjlu.com';

    const verificationResponse = await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 'cf-turnstile-response': token }),
    });

    const contentType = verificationResponse.headers.get('Content-Type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error(`Expected JSON response but received: ${contentType}`);
    }

    const verificationResult = await verificationResponse.json();
    return verificationResult;
  } catch (error) {
    console.error('Error verifying Turnstile token:', error);
    return {
      message: 'An error occurred during CAPTCHA verification.',
      status: 500
    };
  }
}