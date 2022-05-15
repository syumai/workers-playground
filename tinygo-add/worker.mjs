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
    const a = url.searchParams.get("a");
    const b = url.searchParams.get("b");
    if (a === null || b === null) {
      return new Response("add url params like `?a=1&b=2` to results `1 + 2 = 3`", {
        status: 400
      })
    }
    const result = `${a} + ${b} = ${instance.exports.add(a, b)}`;
    return new Response(result);
  },
};
