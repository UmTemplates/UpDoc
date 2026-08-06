const p = /* @__PURE__ */ new Map();
async function d(o, n) {
  try {
    const e = await o.json(), t = e?.title;
    if (typeof t == "string" && t.length > 0)
      return typeof e.detail == "string" && e.detail.length > 0 ? `${t}: ${e.detail}` : t;
  } catch {
  }
  return `${n}: ${o.statusText}`;
}
let s = null, u = null;
async function m(o) {
  return s || (u || (u = (async () => {
    try {
      const n = await fetch("/umbraco/management/api/v1/updoc/workflows/active", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${o}`
        }
      });
      n.ok ? s = await n.json() : s = { documentTypeAliases: [], blueprintIds: [] };
    } catch {
      s = { documentTypeAliases: [], blueprintIds: [] };
    }
    return u = null, s;
  })()), u);
}
async function h(o, n) {
  const e = p.get(o);
  if (e) return e;
  const t = await fetch(
    `/umbraco/management/api/v1/updoc/config/${o}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${n}`
      }
    }
  );
  if (!t.ok)
    return console.warn(`No config found for blueprint ${o}`), null;
  const a = await t.json();
  return p.set(o, a), a;
}
async function w(o, n) {
  const e = await fetch(
    `/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(o)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${n}`
      }
    }
  );
  return e.ok ? e.json() : (console.warn(`No workflow found with alias "${o}"`), null);
}
async function y(o, n, e, t, a, r) {
  const c = await fetch(
    `/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(o)}/destination`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${r}`
      },
      body: JSON.stringify({
        documentTypeAlias: n,
        documentTypeName: e,
        blueprintId: t,
        blueprintName: a
      })
    }
  );
  if (!c.ok) {
    const l = await c.json();
    return console.error("Change destination failed:", l), null;
  }
  return i(), (await c.json()).destination;
}
async function g(o, n) {
  const e = await fetch(
    `/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(o)}/sample-extraction`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${n}`
      }
    }
  );
  return e.ok ? e.json() : null;
}
async function j(o, n, e, t) {
  const a = {};
  n && (a.mediaKey = n), t && (a.url = t);
  const r = await fetch(
    `/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(o)}/sample-extraction`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${e}`
      },
      body: JSON.stringify(a)
    }
  );
  if (!r.ok) {
    const c = await r.json();
    return console.error("Sample extraction failed:", c), null;
  }
  return r.json();
}
async function $(o, n) {
  const e = await fetch(
    `/umbraco/management/api/v1/updoc/extract-rich?mediaKey=${o}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${n}`
      }
    }
  );
  return e.ok ? e.json() : null;
}
async function k(o, n) {
  const e = await fetch(
    `/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(o)}/area-detection`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${n}`
      }
    }
  );
  return e.ok ? e.json() : null;
}
async function C(o, n) {
  const e = await fetch(
    `/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(o)}/transform`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${n}`
      }
    }
  );
  return e.ok ? e.json() : null;
}
async function T(o, n, e) {
  const t = await fetch(
    `/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(o)}/transform`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${e}`
      },
      body: JSON.stringify({ mediaKey: n })
    }
  );
  if (!t.ok) {
    const a = await t.json();
    return console.error("Transform failed:", a), null;
  }
  return t.json();
}
async function v(o, n) {
  const e = await fetch(
    `/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(o)}/retransform`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${n}`
      }
    }
  );
  if (!e.ok) {
    const t = await e.json();
    return console.error("Retransform failed:", t), null;
  }
  return e.json();
}
async function b(o, n, e, t) {
  const a = {};
  n && (a.mediaKey = n), t && (a.url = t);
  const r = await fetch(
    `/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(o)}/transform-adhoc`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${e}`
      },
      body: JSON.stringify(a)
    }
  );
  return r.ok ? r.json() : null;
}
async function A(o, n, e, t) {
  const a = await fetch(
    `/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(o)}/transform/sections/${encodeURIComponent(n)}/included`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${t}`
      },
      body: JSON.stringify({ included: e })
    }
  );
  return a.ok ? a.json() : null;
}
async function S(o, n, e, t, a) {
  const r = await fetch(
    `/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(o)}/transform/sort-order`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${a}`
      },
      body: JSON.stringify({ page: n, areaName: e, sortedIds: t })
    }
  );
  return r.ok ? r.json() : null;
}
async function U(o, n, e) {
  const t = await fetch(
    `/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(o)}/map`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${e}`
      },
      body: JSON.stringify(n)
    }
  );
  if (!t.ok) {
    const a = await t.json();
    return console.error("Save map config failed:", a), null;
  }
  return i(), t.json();
}
async function R(o, n, e) {
  const t = await fetch(
    `/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(o)}/pages`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${e}`
      },
      body: JSON.stringify({ pages: n })
    }
  );
  if (!t.ok) {
    const a = await t.json();
    return console.error("Save page selection failed:", a), !1;
  }
  return i(), !0;
}
async function B(o, n, e) {
  const t = await fetch(
    `/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(o)}/excluded-areas`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${e}`
      },
      body: JSON.stringify({ excludedAreas: n })
    }
  );
  if (!t.ok) {
    const r = await t.json();
    return console.error("Save excluded areas failed:", r), null;
  }
  return i(), (await t.json()).excludedAreas ?? [];
}
async function z(o, n, e) {
  const t = await fetch(
    `/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(o)}/container-overrides`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${e}`
      },
      body: JSON.stringify({ overrides: n ?? [] })
    }
  );
  if (!t.ok) {
    const r = await t.json();
    return console.error("Save container overrides failed:", r), null;
  }
  return i(), (await t.json()).containerOverrides ?? [];
}
async function I(o, n) {
  const e = await fetch(
    `/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(o)}/source`,
    {
      headers: {
        Authorization: `Bearer ${n}`
      }
    }
  );
  return e.ok ? e.json() : null;
}
async function O(o, n) {
  const e = await fetch(
    `/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(o)}/area-template`,
    {
      headers: {
        Authorization: `Bearer ${n}`
      }
    }
  );
  return e.ok ? e.json() : null;
}
async function P(o, n, e) {
  const t = await fetch(
    `/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(o)}/area-template`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${e}`
      },
      body: JSON.stringify(n)
    }
  );
  if (!t.ok) {
    const a = await t.json();
    return console.error("Save area template failed:", a), null;
  }
  return t.json();
}
async function N(o, n) {
  const e = await fetch(
    `/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(o)}/pdf`,
    {
      headers: {
        Authorization: `Bearer ${n}`
      }
    }
  );
  return e.ok ? e.blob() : null;
}
async function x(o, n, e) {
  const t = await fetch(
    `/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(o)}/area-rules`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${e}`
      },
      body: JSON.stringify(n)
    }
  );
  if (!t.ok) {
    const a = await t.json();
    return console.error("Save area rules failed:", a), null;
  }
  return i(), t.json();
}
async function J(o, n, e, t) {
  const a = await fetch(
    `/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(o)}/infer-section-pattern`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${t}`
      },
      body: JSON.stringify({ areaIndex: n, elementId: e })
    }
  );
  if (!a.ok) {
    const r = await a.json();
    return console.error("Infer section pattern failed:", r), null;
  }
  return a.json();
}
async function E(o, n) {
  const e = await fetch(
    `/umbraco/management/api/v1/updoc/workflows/${encodeURIComponent(o)}/regenerate-destination`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${n}`
      }
    }
  );
  if (!e.ok) {
    const a = await e.json();
    return console.error("Regenerate destination failed:", a), null;
  }
  return i(), (await e.json()).destination;
}
function i() {
  p.clear(), s = null, u = null;
}
export {
  i as A,
  h as a,
  w as b,
  N as c,
  y as d,
  $ as e,
  m as f,
  g,
  I as h,
  k as i,
  C as j,
  O as k,
  T as l,
  j as m,
  P as n,
  z as o,
  B as p,
  R as q,
  E as r,
  U as s,
  b as t,
  x as u,
  v,
  S as w,
  A as x,
  J as y,
  d as z
};
//# sourceMappingURL=workflow.service-Coqu6zLj.js.map
