import "./polyfill_performance.js";
import "./wasm_exec.js";

const go = new Go();

let mod;

export function init(m) {
  mod = m;
}

async function run() {
  const readyPromise = new Promise((resolve) => {
    globalThis.ready = resolve;
  });
  const instance = new WebAssembly.Instance(mod, go.importObject);
  go.run(instance);
  await readyPromise;
}

export async function fetch(req, env, ctx) {
  await run();
  return handleRequest(req, { env, ctx });
}

export async function scheduled(event, env, ctx) {
  await run();
  return runScheduler(event, { env, ctx });
}

// onRequest handles request to Cloudflare Pages
export async function onRequest(ctx) {
  await run();
  const { request, env } = ctx;
  return handleRequest(request, { env, ctx });
}