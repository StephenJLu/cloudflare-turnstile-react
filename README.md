# Cloudflare Turnstile Implementation with React and Cloudflare Worker
- 📖 [Full Documentation](https://docs.stephenjlu.com/cloudflare-turnstile/how-to-implement-cloudflares-turnstile)

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
