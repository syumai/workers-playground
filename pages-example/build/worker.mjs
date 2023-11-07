import * as imports from "./shim.mjs";
import mod from "./app.wasm";

imports.init(mod);

export default { fetch: imports.fetch, scheduled: imports.scheduled }
