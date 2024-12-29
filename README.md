# Cloudflare Turnstile Implementation with React and Cloudflare Worker
- 📖 [Full Documentation](https://docs.stephenjlu.com/docs-stephenjlu/projects/how-to-implement-cloudflares-turnstile)
- ⚡ [Live Test Demo](https://www.stephenjlu.com/test)
- 📝 [Blog Post](https://ledger.stephenjlu.com/how-i-made-a-contact-form-bot-killer-using-cloudflare-turnstile-captcha-challenge-plus-a-bonus-honeypot?showSharer=true)

## Test Installation

Install dependencies:

```shellscript
npm install
```

## Deployment

Local Dev:

```sh
npm run dev
```

Then run the app in production mode:

```sh
npm start
```

Production build for deployment:

```sh
npm run build
```

### DIY

If you're familiar with deploying Node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `npm run build`

- `build/server`
- `build/client`
