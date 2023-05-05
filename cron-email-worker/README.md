# cron-email-worker

* A worker to send email with cron job trigger.
* This worker is based on [this documentation](https://developers.cloudflare.com/email-routing/email-workers/send-email-workers/).

## Usage

* Register sender and recipient's email address to Cloudflare.
  - see: https://developers.cloudflare.com/email-routing/get-started/
* set your `senderName`, `senderEmail` and `recipientEmail` to index.js.
* set `destination_address` to wrangler.toml.
* set cron schedule to wrangler.toml.
* deploy worker by `npm run deploy`.

## Debug

* If the cron trigger does not seem to work, uncomment the fetch event handler and request the worker to send an email.
  - `npx wrangler tail` will give you some useful information.

## License

MIT

## Author

syumai

