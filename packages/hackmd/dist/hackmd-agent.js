function j(r) {
  return r && r.__esModule && Object.prototype.hasOwnProperty.call(r, "default") ? r.default : r;
}
var F = { exports: {} }, i = {};
Object.defineProperty(i, "__esModule", {
  value: !0
});
i.DATA_CLONE_ERROR = i.MESSAGE = i.REJECTED = i.FULFILLED = i.REPLY = i.CALL = i.HANDSHAKE_REPLY = i.HANDSHAKE = void 0;
const J = "handshake";
i.HANDSHAKE = J;
const W = "handshake-reply";
i.HANDSHAKE_REPLY = W;
const B = "call";
i.CALL = B;
const q = "reply";
i.REPLY = q;
const k = "fulfilled";
i.FULFILLED = k;
const Q = "rejected";
i.REJECTED = Q;
const X = "message";
i.MESSAGE = X;
const Z = "DataCloneError";
i.DATA_CLONE_ERROR = Z;
var N = {};
Object.defineProperty(N, "__esModule", {
  value: !0
});
N.ERR_NO_IFRAME_SRC = N.ERR_NOT_IN_IFRAME = N.ERR_CONNECTION_TIMEOUT = N.ERR_CONNECTION_DESTROYED = void 0;
const ee = "ConnectionDestroyed";
N.ERR_CONNECTION_DESTROYED = ee;
const re = "ConnectionTimeout";
N.ERR_CONNECTION_TIMEOUT = re;
const te = "NotInIframe";
N.ERR_NOT_IN_IFRAME = te;
const ne = "NoIframeSrc";
N.ERR_NO_IFRAME_SRC = ne;
var $ = { exports: {} };
(function(r, e) {
  Object.defineProperty(e, "__esModule", {
    value: !0
  }), e.default = void 0;
  var t = () => {
    const n = [];
    let c = !1;
    return {
      destroy() {
        c = !0, n.forEach((a) => {
          a();
        });
      },
      onDestroy(a) {
        c ? a() : n.push(a);
      }
    };
  };
  e.default = t, r.exports = e.default;
})($, $.exports);
var oe = $.exports, H = { exports: {} }, A = {};
Object.defineProperty(A, "__esModule", {
  value: !0
});
A.deserializeError = A.serializeError = void 0;
const ae = (r) => {
  let e = r.name, t = r.message, n = r.stack;
  return {
    name: e,
    message: t,
    stack: n
  };
};
A.serializeError = ae;
const ie = (r) => {
  const e = new Error();
  return Object.keys(r).forEach((t) => e[t] = r[t]), e;
};
A.deserializeError = ie;
(function(r, e) {
  Object.defineProperty(e, "__esModule", {
    value: !0
  }), e.default = void 0;
  var t = i, n = A, c = (a, u, v) => {
    const s = a.localName, _ = a.local, E = a.remote, p = a.originForSending, l = a.originForReceiving;
    let f = !1;
    v(`${s}: Connecting call receiver`);
    const O = (d) => {
      if (d.source !== E || d.data.penpal !== t.CALL)
        return;
      if (d.origin !== l) {
        v(`${s} received message from origin ${d.origin} which did not match expected origin ${l}`);
        return;
      }
      const h = d.data, D = h.methodName, S = h.args, T = h.id;
      v(`${s}: Received ${D}() call`);
      const g = (R) => (m) => {
        if (v(`${s}: Sending ${D}() reply`), f) {
          v(`${s}: Unable to send ${D}() reply due to destroyed connection`);
          return;
        }
        const C = {
          penpal: t.REPLY,
          id: T,
          resolution: R,
          returnValue: m
        };
        R === t.REJECTED && m instanceof Error && (C.returnValue = (0, n.serializeError)(m), C.returnValueIsError = !0);
        try {
          E.postMessage(C, p);
        } catch (L) {
          throw L.name === t.DATA_CLONE_ERROR && E.postMessage({
            penpal: t.REPLY,
            id: T,
            resolution: t.REJECTED,
            returnValue: (0, n.serializeError)(L),
            returnValueIsError: !0
          }, p), L;
        }
      };
      new Promise((R) => R(u[D].apply(u, S))).then(g(t.FULFILLED), g(t.REJECTED));
    };
    return _.addEventListener(t.MESSAGE, O), () => {
      f = !0, _.removeEventListener(t.MESSAGE, O);
    };
  };
  e.default = c, r.exports = e.default;
})(H, H.exports);
var se = H.exports, x = { exports: {} }, Y = { exports: {} };
(function(r, e) {
  Object.defineProperty(e, "__esModule", {
    value: !0
  }), e.default = void 0;
  let t = 0;
  var n = () => ++t;
  e.default = n, r.exports = e.default;
})(Y, Y.exports);
var ce = Y.exports;
(function(r, e) {
  Object.defineProperty(e, "__esModule", {
    value: !0
  }), e.default = void 0;
  var t = i, n = N, c = u(ce), a = A;
  function u(s) {
    return s && s.__esModule ? s : { default: s };
  }
  var v = (s, _, E, p, l) => {
    const f = _.localName, O = _.local, d = _.remote, h = _.originForSending, D = _.originForReceiving;
    let S = !1;
    l(`${f}: Connecting call sender`);
    const T = (g) => function() {
      for (var R = arguments.length, m = new Array(R), C = 0; C < R; C++)
        m[C] = arguments[C];
      l(`${f}: Sending ${g}() call`);
      let L;
      try {
        d.closed && (L = !0);
      } catch {
        L = !0;
      }
      if (L && p(), S) {
        const w = new Error(`Unable to send ${g}() call due to destroyed connection`);
        throw w.code = n.ERR_CONNECTION_DESTROYED, w;
      }
      return new Promise((w, P) => {
        const M = (0, c.default)(), I = (o) => {
          if (o.source !== d || o.data.penpal !== t.REPLY || o.data.id !== M)
            return;
          if (o.origin !== D) {
            l(`${f} received message from origin ${o.origin} which did not match expected origin ${D}`);
            return;
          }
          l(`${f}: Received ${g}() reply`), O.removeEventListener(t.MESSAGE, I);
          let y = o.data.returnValue;
          o.data.returnValueIsError && (y = (0, a.deserializeError)(y)), (o.data.resolution === t.FULFILLED ? w : P)(y);
        };
        O.addEventListener(t.MESSAGE, I), d.postMessage({
          penpal: t.CALL,
          id: M,
          methodName: g,
          args: m
        }, h);
      });
    };
    return E.reduce((g, R) => (g[R] = T(R), g), s), () => {
      S = !0;
    };
  };
  e.default = v, r.exports = e.default;
})(x, x.exports);
var de = x.exports, G = { exports: {} };
(function(r, e) {
  Object.defineProperty(e, "__esModule", {
    value: !0
  }), e.default = void 0;
  var t = (n) => function() {
    if (n) {
      for (var c = arguments.length, a = new Array(c), u = 0; u < c; u++)
        a[u] = arguments[u];
      console.log("[Penpal]", ...a);
    }
  };
  e.default = t, r.exports = e.default;
})(G, G.exports);
var le = G.exports;
(function(r, e) {
  Object.defineProperty(e, "__esModule", {
    value: !0
  }), e.default = void 0;
  var t = i, n = N, c = s(oe), a = s(se), u = s(de), v = s(le);
  function s(E) {
    return E && E.__esModule ? E : { default: E };
  }
  var _ = function() {
    let p = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, l = p.parentOrigin, f = l === void 0 ? "*" : l, O = p.methods, d = O === void 0 ? {} : O, h = p.timeout, D = p.debug;
    const S = (0, v.default)(D);
    if (window === window.top) {
      const w = new Error("connectToParent() must be called within an iframe");
      throw w.code = n.ERR_NOT_IN_IFRAME, w;
    }
    const T = (0, c.default)(), g = T.destroy, R = T.onDestroy, m = window, C = m.parent;
    return {
      promise: new Promise((w, P) => {
        let M;
        h !== void 0 && (M = setTimeout(() => {
          const o = new Error(`Connection to parent timed out after ${h}ms`);
          o.code = n.ERR_CONNECTION_TIMEOUT, P(o), g();
        }, h));
        const I = (o) => {
          try {
            clearTimeout();
          } catch {
            return;
          }
          if (o.source !== C || o.data.penpal !== t.HANDSHAKE_REPLY)
            return;
          if (f !== "*" && f !== o.origin) {
            S(`Child received handshake reply from origin ${o.origin} which did not match expected origin ${f}`);
            return;
          }
          S("Child: Received handshake reply"), m.removeEventListener(t.MESSAGE, I);
          const y = {
            localName: "Child",
            local: m,
            remote: C,
            originForSending: o.origin === "null" ? "*" : o.origin,
            originForReceiving: o.origin
          }, z = {}, K = (0, a.default)(y, d, S);
          R(K);
          const b = (0, u.default)(z, y, o.data.methodNames, g, S);
          R(b), clearTimeout(M), w(z);
        };
        m.addEventListener(t.MESSAGE, I), R(() => {
          m.removeEventListener(t.MESSAGE, I);
          const o = new Error("Connection destroyed");
          o.code = n.ERR_CONNECTION_DESTROYED, P(o);
        }), S("Child: Sending handshake"), C.postMessage({
          penpal: t.HANDSHAKE,
          methodNames: Object.keys(d)
        }, f);
      }),
      destroy: g
    };
  };
  e.default = _, r.exports = e.default;
})(F, F.exports);
var ue = F.exports;
const Ee = /* @__PURE__ */ j(ue);
function U(r, e, t, n) {
  var c, a = !1, u = 0;
  function v() {
    c && clearTimeout(c);
  }
  function s() {
    v(), a = !0;
  }
  typeof e != "boolean" && (n = t, t = e, e = void 0);
  function _() {
    for (var E = arguments.length, p = new Array(E), l = 0; l < E; l++)
      p[l] = arguments[l];
    var f = this, O = Date.now() - u;
    if (a)
      return;
    function d() {
      u = Date.now(), t.apply(f, p);
    }
    function h() {
      c = void 0;
    }
    n && !c && d(), v(), n === void 0 && O > r ? d() : e !== !0 && (c = setTimeout(n ? h : d, n === void 0 ? r - O : r));
  }
  return _.cancel = s, _;
}
function fe(r, e, t) {
  return t === void 0 ? U(r, e, !1) : U(r, t, e !== !1);
}
const ge = !1, Re = "<%= origin %>";
function _e() {
  return window.editor.doc.getValue();
}
function V(r) {
  window.editor.doc.setValue(r);
}
function ve(r) {
  if (window.cmClient != null) {
    V(r);
    return;
  }
  const e = setInterval(() => {
    window.cmClient != null && (clearInterval(e), V(r));
  }, 250);
}
function pe(r) {
  window.growi.notifyBodyChanges(r);
}
const me = fe(800, pe);
function Ce(r) {
  window.growi.saveWithShortcut(r);
}
function Oe() {
  const r = window.CodeMirror, e = window.editor;
  r == null || e == null || (e.on("change", (t, n) => {
    n.origin !== "ignoreHistory" && me(t.doc.getValue());
  }), r.commands.save = function(t) {
    Ce(t.doc.getValue());
  }, delete e.options.extraKeys["Cmd-S"], delete e.options.extraKeys["Ctrl-S"]);
}
function he() {
  Ee({
    parentOrigin: Re,
    // Methods child is exposing to parent
    methods: {
      getValue() {
        return _e();
      },
      setValue(e) {
        V(e);
      },
      setValueOnInit(e) {
        ve(e);
      }
    },
    debug: ge
  }).promise.then((e) => {
    window.growi = e;
  }).catch((e) => {
    console.log(e);
  });
}
(function() {
  if (window === window.parent) {
    console.log("[GROWI] Loading agent for HackMD is not processed because currently not in iframe");
    return;
  }
  console.log("[HackMD] Loading GROWI agent for HackMD..."), window.addEventListener("load", () => {
    Oe();
  }), he(), console.log("[HackMD] GROWI agent for HackMD has successfully loaded.");
})();
//# sourceMappingURL=hackmd-agent.js.map
