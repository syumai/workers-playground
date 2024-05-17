import mod from './add.wasm';

export default {
	async fetch(request, env, ctx) {
		const instance = new WebAssembly.Instance(mod);
		return new Response(instance.exports.add(1, 2));
	},
};
