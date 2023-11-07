import mod from "../../build/app.wasm";
import * as imports from "../../build/shim.mjs"

imports.init(mod);

export const onRequest = imports.onRequest;
