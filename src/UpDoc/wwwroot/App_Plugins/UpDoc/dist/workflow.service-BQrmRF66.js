const p = /* @__PURE__ */ new Map();
let s = null, c = null;
async function d(o) {
  return s || (c || (c = (async () => {
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
    return c = null, s;
  })()), c);
}
async function m(o, n) {
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
async function h(o, n) {
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
async function w(o, n, e, t, a, r) {
  const i = await fetch(
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
  if (!i.ok) {
    const f = await i.json();
    return console.error("Change destination failed:", f), null;
  }
  return u(), (await i.json()).destination;
}
async function y(o, n) {
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
async function g(o, n, e, t) {
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
    const i = await r.json();
    return console.error("Sample extraction failed:", i), null;
  }
  return r.json();
}
async function j(o, n) {
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
async function $(o, n, e) {
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
async function T(o, n, e, t) {
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
async function b(o, n, e, t) {
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
async function v(o, n, e) {
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
  return u(), t.json();
}
async function A(o, n, e) {
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
  return u(), !0;
}
async function S(o, n, e) {
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
  return u(), (await t.json()).excludedAreas ?? [];
}
async function U(o, n) {
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
async function B(o, n) {
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
async function R(o, n, e) {
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
async function z(o, n) {
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
async function I(o, n, e) {
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
  return u(), t.json();
}
async function O(o, n, e, t) {
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
function u() {
  p.clear(), s = null, c = null;
}
export {
  m as a,
  h as b,
  z as c,
  w as d,
  j as e,
  d as f,
  y as g,
  U as h,
  k as i,
  C as j,
  B as k,
  $ as l,
  g as m,
  S as n,
  A as o,
  I as p,
  v as q,
  O as r,
  R as s,
  T as t,
  b as u,
  u as v
};
//# sourceMappingURL=workflow.service-BQrmRF66.js.map
