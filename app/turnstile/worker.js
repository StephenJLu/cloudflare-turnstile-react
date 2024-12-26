/* Cloudflare Turnstile Worker
   Ensure you have your secret key stored as an environment variable for your worker */

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*', // CHANGE THIS TO YOUR DOMAIN
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Allow-Headers': 'Content-Type'
};

const createResponse = (/** @type {{ success: boolean; error: string; }} */ body, status = 200) => 
  new Response(JSON.stringify(body), { 
    status, 
    headers: CORS_HEADERS 
  });

export default {
  /**
   * @param {{ method: string; json: () => PromiseLike<{ "cf-turnstile-response": any; }> | { "cf-turnstile-response": any; }; headers: { get: (arg0: string) => string; }; }} request
   * @param {{ CFT_SECRET_KEY: any; }} env
   */
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return createResponse({ success: false, error: 'Method Not Allowed' }, 405);
    }

    try {
      const { 'cf-turnstile-response': token } = await request.json();
      const ip = request.headers.get('CF-Connecting-IP') || '';

      if (!token) {
        return createResponse({ success: false, error: 'Token missing' }, 400);
      }

      const verificationResponse = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: env.CFT_SECRET_KEY,
            response: token,
            remoteip: ip,
          }),
        }
      );

      const outcome = await verificationResponse.json();
      return createResponse(outcome, outcome.success ? 200 : 400);

    } catch (error) {
      console.error('Error:', error);
      return createResponse({ success: false, error: 'Internal Server Error' }, 500);
    }
  }
};