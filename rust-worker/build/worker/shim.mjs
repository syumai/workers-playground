var W = Object.defineProperty;
var $ = (e, t) => {
	for (var n in t) W(e, n, { get: t[n], enumerable: !0 });
};
var l = {};
$(l, {
	IntoUnderlyingByteSource: () => M,
	IntoUnderlyingSink: () => T,
	IntoUnderlyingSource: () => q,
	MinifyConfig: () => S,
	PipeOptions: () => C,
	PolishConfig: () => K,
	QueuingStrategy: () => L,
	ReadableStreamGetReaderOptions: () => F,
	RequestRedirect: () => X,
	__wbg_buffer_610b70c8fd30da2d: () => bt,
	__wbg_buffer_cf65c07de34b9a08: () => Vt,
	__wbg_byobRequest_a3c74c3694777d1b: () => it,
	__wbg_byteLength_1fef7842ca4200fa: () => pt,
	__wbg_byteOffset_ede786cfcf88d3dd: () => lt,
	__wbg_bytesliteral_efe7d360639bf32b: () => dt,
	__wbg_call_9495de66fdbe016b: () => Wt,
	__wbg_cf_39b771fa14f2a306: () => At,
	__wbg_close_045ed342139beb7d: () => ut,
	__wbg_close_a41954830b65c455: () => ct,
	__wbg_constructor_0c9828c8a7cf1dc6: () => Nt,
	__wbg_enqueue_3a8a8e67e44d2567: () => st,
	__wbg_error_f851667af71bcfc6: () => tt,
	__wbg_formData_59462580e5ad0333: () => Ot,
	__wbg_get_964ac3a6e1b332de: () => St,
	__wbg_get_baf4855f9a986186: () => Lt,
	__wbg_headers_f532fe1451246dc2: () => Et,
	__wbg_instanceof_Error_749a7378f4439ee0: () => Rt,
	__wbg_instanceof_File_1180804f88c1496c: () => Ct,
	__wbg_latitude_31ff2ecb9665eb67: () => yt,
	__wbg_length_27a2afe8ab42b09f: () => Xt,
	__wbg_log_90b96707fdde4735: () => qt,
	__wbg_longitude_3dde61f94e0ccf98: () => mt,
	__wbg_method_49c95fd930dbf052: () => jt,
	__wbg_name_4e66d4cfa3e9270a: () => $t,
	__wbg_new0_25059e40b1c02766: () => zt,
	__wbg_new_15d3966e9981a196: () => vt,
	__wbg_new_9d3a9ce4282a18a8: () => Ht,
	__wbg_new_abda76e883ba8a5f: () => G,
	__wbg_new_c0452133ff89f108: () => Mt,
	__wbg_new_f9876326328f45ed: () => Ft,
	__wbg_newwithbyteoffsetandlength_9fb2f11355ecadf5: () => Bt,
	__wbg_newwithlength_b56c882b57805732: () => Yt,
	__wbg_newwithoptstrandinit_54154dc29fd0b227: () => wt,
	__wbg_newwithoptstreamandinit_4d872a5331b03046: () => ht,
	__wbg_newwithoptu8arrayandinit_dc996cec531611bc: () => gt,
	__wbg_region_5484949bd23277f1: () => xt,
	__wbg_resolve_fd40f858d9db1a04: () => Pt,
	__wbg_respond_f4778bef04e912a6: () => at,
	__wbg_set_0ee2e91570c4cd85: () => Tt,
	__wbg_set_17499e8aa4003ebd: () => Kt,
	__wbg_set_6aa458a4ebdb65cb: () => Zt,
	__wbg_stack_658279fe44541cf6: () => Q,
	__wbg_then_ec5db6d509eb475f: () => Ut,
	__wbg_then_f753623316e2873a: () => Jt,
	__wbg_toString_4f53179351070600: () => It,
	__wbg_toString_cec163b212643722: () => Dt,
	__wbg_url_031236c2d2eef60c: () => kt,
	__wbg_view_d1a31268af734e5d: () => ft,
	__wbindgen_cb_drop: () => rt,
	__wbindgen_closure_wrapper674: () => ee,
	__wbindgen_debug_string: () => Gt,
	__wbindgen_is_undefined: () => ot,
	__wbindgen_memory: () => te,
	__wbindgen_number_new: () => et,
	__wbindgen_object_clone_ref: () => _t,
	__wbindgen_object_drop_ref: () => Y,
	__wbindgen_string_get: () => Z,
	__wbindgen_string_new: () => nt,
	__wbindgen_throw: () => Qt,
	fetch: () => R,
});
function v() {
	return "bytes";
}
import z from "./index.wasm";
var I = new WebAssembly.Instance(z, { "./index_bg.js": l }),
	r = I.exports;
var d = new Array(128).fill(void 0);
d.push(void 0, null, !0, !1);
function o(e) {
	return d[e];
}
var m = d.length;
function N(e) {
	e < 132 || ((d[e] = m), (m = e));
}
function b(e) {
	let t = o(e);
	return N(e), t;
}
var p = 0,
	j = null;
function E() {
	return (
		(j === null || j.byteLength === 0) && (j = new Uint8Array(r.memory.buffer)),
		j
	);
}
var H =
		typeof TextEncoder > "u"
			? (0, module.require)("util").TextEncoder
			: TextEncoder,
	O = new H("utf-8"),
	P =
		typeof O.encodeInto == "function"
			? function (e, t) {
					return O.encodeInto(e, t);
			  }
			: function (e, t) {
					let n = O.encode(e);
					return t.set(n), { read: e.length, written: n.length };
			  };
function h(e, t, n) {
	if (n === void 0) {
		let u = O.encode(e),
			x = t(u.length);
		return (
			E()
				.subarray(x, x + u.length)
				.set(u),
			(p = u.length),
			x
		);
	}
	let _ = e.length,
		c = t(_),
		a = E(),
		i = 0;
	for (; i < _; i++) {
		let u = e.charCodeAt(i);
		if (u > 127) break;
		a[c + i] = u;
	}
	if (i !== _) {
		i !== 0 && (e = e.slice(i)), (c = n(c, _, (_ = i + e.length * 3)));
		let u = E().subarray(c + i, c + _);
		i += P(e, u).written;
	}
	return (p = i), c;
}
function y(e) {
	return e == null;
}
var k = null;
function f() {
	return (
		(k === null || k.byteLength === 0) && (k = new Int32Array(r.memory.buffer)),
		k
	);
}
function s(e) {
	m === d.length && d.push(d.length + 1);
	let t = m;
	return (m = d[t]), (d[t] = e), t;
}
var U =
		typeof TextDecoder > "u"
			? (0, module.require)("util").TextDecoder
			: TextDecoder,
	D = new U("utf-8", { ignoreBOM: !0, fatal: !0 });
D.decode();
function g(e, t) {
	return D.decode(E().subarray(e, e + t));
}
function A(e) {
	let t = typeof e;
	if (t == "number" || t == "boolean" || e == null) return `${e}`;
	if (t == "string") return `"${e}"`;
	if (t == "symbol") {
		let c = e.description;
		return c == null ? "Symbol" : `Symbol(${c})`;
	}
	if (t == "function") {
		let c = e.name;
		return typeof c == "string" && c.length > 0 ? `Function(${c})` : "Function";
	}
	if (Array.isArray(e)) {
		let c = e.length,
			a = "[";
		c > 0 && (a += A(e[0]));
		for (let i = 1; i < c; i++) a += ", " + A(e[i]);
		return (a += "]"), a;
	}
	let n = /\[object ([^\]]+)\]/.exec(toString.call(e)),
		_;
	if (n.length > 1) _ = n[1];
	else return toString.call(e);
	if (_ == "Object")
		try {
			return "Object(" + JSON.stringify(e) + ")";
		} catch {
			return "Object";
		}
	return e instanceof Error
		? `${e.name}: ${e.message}
${e.stack}`
		: _;
}
function J(e, t, n, _) {
	let c = { a: e, b: t, cnt: 1, dtor: n },
		a = (...i) => {
			c.cnt++;
			let u = c.a;
			c.a = 0;
			try {
				return _(u, c.b, ...i);
			} finally {
				--c.cnt === 0 ? r.__wbindgen_export_2.get(c.dtor)(u, c.b) : (c.a = u);
			}
		};
	return (a.original = c), a;
}
function V(e, t, n) {
	r._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h670b3d96614a207b(
		e,
		t,
		s(n)
	);
}
function R(e, t, n) {
	let _ = r.fetch(s(e), s(t), s(n));
	return b(_);
}
function w(e, t) {
	try {
		return e.apply(this, t);
	} catch (n) {
		r.__wbindgen_exn_store(s(n));
	}
}
function B(e, t, n, _) {
	r.wasm_bindgen__convert__closures__invoke2_mut__h54bac9b2a7cb6f92(
		e,
		t,
		s(n),
		s(_)
	);
}
var K = Object.freeze({
		Off: 0,
		0: "Off",
		Lossy: 1,
		1: "Lossy",
		Lossless: 2,
		2: "Lossless",
	}),
	X = Object.freeze({
		Error: 0,
		0: "Error",
		Follow: 1,
		1: "Follow",
		Manual: 2,
		2: "Manual",
	}),
	M = class {
		__destroy_into_raw() {
			let t = this.ptr;
			return (this.ptr = 0), t;
		}
		free() {
			let t = this.__destroy_into_raw();
			r.__wbg_intounderlyingbytesource_free(t);
		}
		get type() {
			let t = r.intounderlyingbytesource_type(this.ptr);
			return b(t);
		}
		get autoAllocateChunkSize() {
			return r.intounderlyingbytesource_autoAllocateChunkSize(this.ptr) >>> 0;
		}
		start(t) {
			r.intounderlyingbytesource_start(this.ptr, s(t));
		}
		pull(t) {
			let n = r.intounderlyingbytesource_pull(this.ptr, s(t));
			return b(n);
		}
		cancel() {
			let t = this.__destroy_into_raw();
			r.intounderlyingbytesource_cancel(t);
		}
	},
	T = class {
		__destroy_into_raw() {
			let t = this.ptr;
			return (this.ptr = 0), t;
		}
		free() {
			let t = this.__destroy_into_raw();
			r.__wbg_intounderlyingsink_free(t);
		}
		write(t) {
			let n = r.intounderlyingsink_write(this.ptr, s(t));
			return b(n);
		}
		close() {
			let t = this.__destroy_into_raw(),
				n = r.intounderlyingsink_close(t);
			return b(n);
		}
		abort(t) {
			let n = this.__destroy_into_raw(),
				_ = r.intounderlyingsink_abort(n, s(t));
			return b(_);
		}
	},
	q = class {
		__destroy_into_raw() {
			let t = this.ptr;
			return (this.ptr = 0), t;
		}
		free() {
			let t = this.__destroy_into_raw();
			r.__wbg_intounderlyingsource_free(t);
		}
		pull(t) {
			let n = r.intounderlyingsource_pull(this.ptr, s(t));
			return b(n);
		}
		cancel() {
			let t = this.__destroy_into_raw();
			r.intounderlyingsource_cancel(t);
		}
	},
	S = class {
		__destroy_into_raw() {
			let t = this.ptr;
			return (this.ptr = 0), t;
		}
		free() {
			let t = this.__destroy_into_raw();
			r.__wbg_minifyconfig_free(t);
		}
		get js() {
			return r.__wbg_get_minifyconfig_js(this.ptr) !== 0;
		}
		set js(t) {
			r.__wbg_set_minifyconfig_js(this.ptr, t);
		}
		get html() {
			return r.__wbg_get_minifyconfig_html(this.ptr) !== 0;
		}
		set html(t) {
			r.__wbg_set_minifyconfig_html(this.ptr, t);
		}
		get css() {
			return r.__wbg_get_minifyconfig_css(this.ptr) !== 0;
		}
		set css(t) {
			r.__wbg_set_minifyconfig_css(this.ptr, t);
		}
	},
	C = class {
		__destroy_into_raw() {
			let t = this.ptr;
			return (this.ptr = 0), t;
		}
		free() {
			let t = this.__destroy_into_raw();
			r.__wbg_pipeoptions_free(t);
		}
		get preventClose() {
			return r.pipeoptions_preventClose(this.ptr) !== 0;
		}
		get preventCancel() {
			return r.pipeoptions_preventCancel(this.ptr) !== 0;
		}
		get preventAbort() {
			return r.pipeoptions_preventAbort(this.ptr) !== 0;
		}
		get signal() {
			let t = r.pipeoptions_signal(this.ptr);
			return b(t);
		}
	},
	L = class {
		__destroy_into_raw() {
			let t = this.ptr;
			return (this.ptr = 0), t;
		}
		free() {
			let t = this.__destroy_into_raw();
			r.__wbg_queuingstrategy_free(t);
		}
		get highWaterMark() {
			return r.queuingstrategy_highWaterMark(this.ptr);
		}
	},
	F = class {
		__destroy_into_raw() {
			let t = this.ptr;
			return (this.ptr = 0), t;
		}
		free() {
			let t = this.__destroy_into_raw();
			r.__wbg_readablestreamgetreaderoptions_free(t);
		}
		get mode() {
			let t = r.readablestreamgetreaderoptions_mode(this.ptr);
			return b(t);
		}
	};
function Y(e) {
	b(e);
}
function Z(e, t) {
	let n = o(t),
		_ = typeof n == "string" ? n : void 0;
	var c = y(_) ? 0 : h(_, r.__wbindgen_malloc, r.__wbindgen_realloc),
		a = p;
	(f()[e / 4 + 1] = a), (f()[e / 4 + 0] = c);
}
function G() {
	let e = new Error();
	return s(e);
}
function Q(e, t) {
	let n = o(t).stack,
		_ = h(n, r.__wbindgen_malloc, r.__wbindgen_realloc),
		c = p;
	(f()[e / 4 + 1] = c), (f()[e / 4 + 0] = _);
}
function tt(e, t) {
	try {
		console.error(g(e, t));
	} finally {
		r.__wbindgen_free(e, t);
	}
}
function et(e) {
	return s(e);
}
function nt(e, t) {
	let n = g(e, t);
	return s(n);
}
function rt(e) {
	let t = b(e).original;
	return t.cnt-- == 1 ? ((t.a = 0), !0) : !1;
}
function ot(e) {
	return o(e) === void 0;
}
function _t(e) {
	let t = o(e);
	return s(t);
}
function ct(e) {
	o(e).close();
}
function st(e, t) {
	o(e).enqueue(o(t));
}
function it(e) {
	let t = o(e).byobRequest;
	return y(t) ? 0 : s(t);
}
function ut(e) {
	o(e).close();
}
function ft(e) {
	let t = o(e).view;
	return y(t) ? 0 : s(t);
}
function at(e, t) {
	o(e).respond(t >>> 0);
}
function bt(e) {
	let t = o(e).buffer;
	return s(t);
}
function lt(e) {
	return o(e).byteOffset;
}
function pt(e) {
	return o(e).byteLength;
}
function dt() {
	let e = v();
	return s(e);
}
function gt() {
	return w(function (e, t) {
		let n = new Response(b(e), o(t));
		return s(n);
	}, arguments);
}
function wt() {
	return w(function (e, t, n) {
		let _ = new Response(e === 0 ? void 0 : g(e, t), o(n));
		return s(_);
	}, arguments);
}
function ht() {
	return w(function (e, t) {
		let n = new Response(b(e), o(t));
		return s(n);
	}, arguments);
}
function yt(e, t) {
	let n = o(t).latitude;
	var _ = y(n) ? 0 : h(n, r.__wbindgen_malloc, r.__wbindgen_realloc),
		c = p;
	(f()[e / 4 + 1] = c), (f()[e / 4 + 0] = _);
}
function mt(e, t) {
	let n = o(t).longitude;
	var _ = y(n) ? 0 : h(n, r.__wbindgen_malloc, r.__wbindgen_realloc),
		c = p;
	(f()[e / 4 + 1] = c), (f()[e / 4 + 0] = _);
}
function xt(e, t) {
	let n = o(t).region;
	var _ = y(n) ? 0 : h(n, r.__wbindgen_malloc, r.__wbindgen_realloc),
		c = p;
	(f()[e / 4 + 1] = c), (f()[e / 4 + 0] = _);
}
function jt(e, t) {
	let n = o(t).method,
		_ = h(n, r.__wbindgen_malloc, r.__wbindgen_realloc),
		c = p;
	(f()[e / 4 + 1] = c), (f()[e / 4 + 0] = _);
}
function kt(e, t) {
	let n = o(t).url,
		_ = h(n, r.__wbindgen_malloc, r.__wbindgen_realloc),
		c = p;
	(f()[e / 4 + 1] = c), (f()[e / 4 + 0] = _);
}
function Et(e) {
	let t = o(e).headers;
	return s(t);
}
function Ot() {
	return w(function (e) {
		let t = o(e).formData();
		return s(t);
	}, arguments);
}
function At(e) {
	let t = o(e).cf;
	return s(t);
}
function Mt() {
	return w(function () {
		let e = new Headers();
		return s(e);
	}, arguments);
}
function Tt() {
	return w(function (e, t, n, _, c) {
		o(e).set(g(t, n), g(_, c));
	}, arguments);
}
function qt(e, t) {
	console.log(g(e, t));
}
function St(e, t, n) {
	let _ = o(e).get(g(t, n));
	return s(_);
}
function Ct(e) {
	let t;
	try {
		t = o(e) instanceof File;
	} catch {
		t = !1;
	}
	return t;
}
function Lt() {
	return w(function (e, t) {
		let n = Reflect.get(o(e), o(t));
		return s(n);
	}, arguments);
}
function Ft() {
	let e = new Object();
	return s(e);
}
function Rt(e) {
	let t;
	try {
		t = o(e) instanceof Error;
	} catch {
		t = !1;
	}
	return t;
}
function vt(e, t) {
	let n = new Error(g(e, t));
	return s(n);
}
function Dt(e) {
	let t = o(e).toString();
	return s(t);
}
function Wt() {
	return w(function (e, t, n) {
		let _ = o(e).call(o(t), o(n));
		return s(_);
	}, arguments);
}
function $t(e) {
	let t = o(e).name;
	return s(t);
}
function zt() {
	let e = new Date();
	return s(e);
}
function It(e) {
	let t = o(e).toString();
	return s(t);
}
function Nt(e) {
	let t = o(e).constructor;
	return s(t);
}
function Ht(e, t) {
	try {
		var n = { a: e, b: t },
			_ = (a, i) => {
				let u = n.a;
				n.a = 0;
				try {
					return B(u, n.b, a, i);
				} finally {
					n.a = u;
				}
			};
		let c = new Promise(_);
		return s(c);
	} finally {
		n.a = n.b = 0;
	}
}
function Pt(e) {
	let t = Promise.resolve(o(e));
	return s(t);
}
function Ut(e, t) {
	let n = o(e).then(o(t));
	return s(n);
}
function Jt(e, t, n) {
	let _ = o(e).then(o(t), o(n));
	return s(_);
}
function Vt(e) {
	let t = o(e).buffer;
	return s(t);
}
function Bt(e, t, n) {
	let _ = new Uint8Array(o(e), t >>> 0, n >>> 0);
	return s(_);
}
function Kt(e, t, n) {
	o(e).set(o(t), n >>> 0);
}
function Xt(e) {
	return o(e).length;
}
function Yt(e) {
	let t = new Uint8Array(e >>> 0);
	return s(t);
}
function Zt() {
	return w(function (e, t, n) {
		return Reflect.set(o(e), o(t), o(n));
	}, arguments);
}
function Gt(e, t) {
	let n = A(o(t)),
		_ = h(n, r.__wbindgen_malloc, r.__wbindgen_realloc),
		c = p;
	(f()[e / 4 + 1] = c), (f()[e / 4 + 0] = _);
}
function Qt(e, t) {
	throw new Error(g(e, t));
}
function te() {
	let e = r.memory;
	return s(e);
}
function ee(e, t, n) {
	let _ = J(e, t, 104, V);
	return s(_);
}
(void 0)?.();
var ie = { fetch: R, scheduled: void 0, queue: void 0 };
export {
	M as IntoUnderlyingByteSource,
	T as IntoUnderlyingSink,
	q as IntoUnderlyingSource,
	S as MinifyConfig,
	C as PipeOptions,
	K as PolishConfig,
	L as QueuingStrategy,
	F as ReadableStreamGetReaderOptions,
	X as RequestRedirect,
	bt as __wbg_buffer_610b70c8fd30da2d,
	Vt as __wbg_buffer_cf65c07de34b9a08,
	it as __wbg_byobRequest_a3c74c3694777d1b,
	pt as __wbg_byteLength_1fef7842ca4200fa,
	lt as __wbg_byteOffset_ede786cfcf88d3dd,
	dt as __wbg_bytesliteral_efe7d360639bf32b,
	Wt as __wbg_call_9495de66fdbe016b,
	At as __wbg_cf_39b771fa14f2a306,
	ut as __wbg_close_045ed342139beb7d,
	ct as __wbg_close_a41954830b65c455,
	Nt as __wbg_constructor_0c9828c8a7cf1dc6,
	st as __wbg_enqueue_3a8a8e67e44d2567,
	tt as __wbg_error_f851667af71bcfc6,
	Ot as __wbg_formData_59462580e5ad0333,
	St as __wbg_get_964ac3a6e1b332de,
	Lt as __wbg_get_baf4855f9a986186,
	Et as __wbg_headers_f532fe1451246dc2,
	Rt as __wbg_instanceof_Error_749a7378f4439ee0,
	Ct as __wbg_instanceof_File_1180804f88c1496c,
	yt as __wbg_latitude_31ff2ecb9665eb67,
	Xt as __wbg_length_27a2afe8ab42b09f,
	qt as __wbg_log_90b96707fdde4735,
	mt as __wbg_longitude_3dde61f94e0ccf98,
	jt as __wbg_method_49c95fd930dbf052,
	$t as __wbg_name_4e66d4cfa3e9270a,
	zt as __wbg_new0_25059e40b1c02766,
	vt as __wbg_new_15d3966e9981a196,
	Ht as __wbg_new_9d3a9ce4282a18a8,
	G as __wbg_new_abda76e883ba8a5f,
	Mt as __wbg_new_c0452133ff89f108,
	Ft as __wbg_new_f9876326328f45ed,
	Bt as __wbg_newwithbyteoffsetandlength_9fb2f11355ecadf5,
	Yt as __wbg_newwithlength_b56c882b57805732,
	wt as __wbg_newwithoptstrandinit_54154dc29fd0b227,
	ht as __wbg_newwithoptstreamandinit_4d872a5331b03046,
	gt as __wbg_newwithoptu8arrayandinit_dc996cec531611bc,
	xt as __wbg_region_5484949bd23277f1,
	Pt as __wbg_resolve_fd40f858d9db1a04,
	at as __wbg_respond_f4778bef04e912a6,
	Tt as __wbg_set_0ee2e91570c4cd85,
	Kt as __wbg_set_17499e8aa4003ebd,
	Zt as __wbg_set_6aa458a4ebdb65cb,
	Q as __wbg_stack_658279fe44541cf6,
	Ut as __wbg_then_ec5db6d509eb475f,
	Jt as __wbg_then_f753623316e2873a,
	It as __wbg_toString_4f53179351070600,
	Dt as __wbg_toString_cec163b212643722,
	kt as __wbg_url_031236c2d2eef60c,
	ft as __wbg_view_d1a31268af734e5d,
	rt as __wbindgen_cb_drop,
	ee as __wbindgen_closure_wrapper674,
	Gt as __wbindgen_debug_string,
	ot as __wbindgen_is_undefined,
	te as __wbindgen_memory,
	et as __wbindgen_number_new,
	_t as __wbindgen_object_clone_ref,
	Y as __wbindgen_object_drop_ref,
	Z as __wbindgen_string_get,
	nt as __wbindgen_string_new,
	Qt as __wbindgen_throw,
	ie as default,
	R as fetch,
};
