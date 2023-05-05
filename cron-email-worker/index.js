import { EmailMessage } from 'cloudflare:email';
import { createMimeMessage } from 'mimetext';

const senderName = 'syumai';
const senderEmail = 'syumai@syum.ai';
const recipientEmail = 'syumai+syum.ai@gmail.com';

const run = async env => {
	const msg = createMimeMessage();
	msg.setSender({ name: senderName, addr: senderEmail });
	msg.setRecipient(recipientEmail);
	msg.setSubject('received an email!');
	msg.addMessage({
		contentType: 'text/plain',
		data: 'This is an email!',
	});
	const email = new EmailMessage(senderEmail, recipientEmail, msg.asRaw());
	await env.SEB.send(email);
};

export default {
	async scheduled(_, env, ctx) {
		ctx.waitUntil(run(env));
	},
	// /* Uncomment this if you want to test sending email on request worker. */
	// async fetch(_, env) {
	//   await run(env);
	//   return Response.json({ "message": "success!" });
	// },
};
