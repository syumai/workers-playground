import "./polyfill/performance.mjs";
import "./wasm_exec.js";
import mod from "./dist/app.wasm";

const go = new Go();

const load = WebAssembly.instantiate(mod, go.importObject).then((instance) => {
  go.run(instance);
  return instance;
});

export default {
  async fetch(req) {
    const instance = await load;
    const url = new URL(req.url);
    const a = url.searchParams.get("a") ?? 1;
    const b = url.searchParams.get("b") ?? 1;
    const result = `${a} + ${b} = ${instance.exports.add(a, b)}`;
    return new Response(result);
  },
};
