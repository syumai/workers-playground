export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const list = await env.BUCKET.list();
		const blobs: Blob[] = [];
		for (const obj of list.objects) {
			const objBody = await env.BUCKET.get(obj.key);
			if (!objBody) {
				continue;
			}
			const reader = objBody.body.getReader();
			const chunks: Uint8Array[] = [];
			do {
				const result = await reader.read();
				if (result.done) {
					break;
				}
				const chunk: Uint8Array = result.value;
				chunks.push(chunk);
				console.log(chunk.byteLength);
			} while (true);
			const blob = new Blob(chunks, {
				type: obj.httpMetadata?.contentType,
			});
			blobs.push(blob);
			break;
		}
		return new Response(blobs[0]);
	},
};
