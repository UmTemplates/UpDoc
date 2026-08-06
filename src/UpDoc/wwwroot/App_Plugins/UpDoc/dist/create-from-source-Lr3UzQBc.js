import { I as O } from "./workflow.types-QrurYwv2.js";
import { s as $, c as U, a as L, b as B, d as h, m as T } from "./transforms-qqnY8EQ-.js";
function I(t) {
  return [
    {
      key: crypto.randomUUID(),
      mediaKey: t,
      mediaTypeAlias: "",
      crops: [],
      focalPoint: null
    }
  ];
}
function J(t, o, l) {
  if (o.blockKey) {
    console.warn(
      `UpDoc: import-fact mapping to a block property ("${o.target}") is not supported yet — skipped.`
    );
    return;
  }
  const n = I(l), e = t.find((a) => a.alias === o.target);
  e ? e.value = n : t.push({ alias: o.target, value: n });
}
function M(t) {
  const o = {}, l = {};
  for (const n of t)
    if (n.included) {
      if (n.heading) {
        const e = n.pattern === "role" ? n.content : n.heading;
        o[`${n.id}.heading`] = e, o[`${n.id}.title`] = e;
      }
      o[`${n.id}.content`] = n.content, n.description && (o[`${n.id}.description`] = n.description), n.summary && (o[`${n.id}.summary`] = n.summary), n.stableKey && (l[n.stableKey] = n.id);
    }
  return { sectionLookup: o, stableKeyLookup: l };
}
async function P(t) {
  const {
    parentUnique: o,
    documentTypeUnique: l,
    blueprintUnique: n,
    name: e,
    mediaUnique: a,
    sectionLookup: s,
    stableKeyLookup: i,
    config: c,
    fetchFn: r,
    token: p
  } = t, u = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${p}`
  }, y = await r(
    `/umbraco/management/api/v1/document-blueprint/${n}/scaffold`,
    { method: "GET", headers: u }
  );
  if (!y.ok)
    return { ok: !1, stage: "scaffold", message: await x(y) };
  const f = await y.json(), d = f.values ? JSON.parse(JSON.stringify(f.values)) : [];
  N(d, { sectionLookup: s, stableKeyLookup: i, config: c, mediaUnique: a });
  const S = {
    parent: o ? { id: o } : null,
    documentType: { id: l },
    template: f.template ? { id: f.template.id } : null,
    values: d,
    variants: [{ name: e, culture: null, segment: null }]
  }, k = await r("/umbraco/management/api/v1/document", {
    method: "POST",
    headers: u,
    body: JSON.stringify(S)
  });
  if (!k.ok)
    return { ok: !1, stage: "create", message: await x(k) };
  const m = k.headers.get("Location")?.split("/").pop();
  if (m) {
    const v = await r(`/umbraco/management/api/v1/document/${m}`, {
      method: "GET",
      headers: u
    });
    if (v.ok) {
      const V = await v.json(), b = await r(`/umbraco/management/api/v1/document/${m}`, {
        method: "PUT",
        headers: u,
        body: JSON.stringify(V)
      });
      b.ok || console.warn("UpDoc: document created, but the follow-up save failed:", await b.text());
    } else
      console.warn("UpDoc: document created, but could not be read back for saving:", await v.text());
  }
  return { ok: !0, documentId: m };
}
function N(t, o) {
  const { sectionLookup: l, stableKeyLookup: n, config: e, mediaUnique: a } = o, s = /* @__PURE__ */ new Set();
  for (const i of e.map.mappings) {
    if (i.enabled === !1) continue;
    if (i.source === O) {
      if (!a) continue;
      for (const r of i.destinations)
        J(t, r, a);
      continue;
    }
    let c = l[i.source];
    if (!c && i.sourceKey && n) {
      const r = n[i.sourceKey];
      if (r) {
        const p = i.source.split(".").pop();
        p && (c = l[`${r}.${p}`]);
      }
    }
    if (c)
      for (const r of i.destinations)
        R(t, r, c, e, s);
  }
  C(t, e, s);
}
function R(t, o, l, n, e) {
  const a = l;
  if (o.contentTypeKey) {
    for (const i of g(n))
      K(
        t,
        i.alias,
        o.contentTypeKey,
        o.target,
        a,
        e
      );
    return;
  }
  if (o.blockKey) {
    for (const i of g(n)) {
      const c = i.blocks.find((r) => r.key === o.blockKey);
      if (c) {
        c.contentTypeKey ? K(
          t,
          i.alias,
          c.contentTypeKey,
          o.target,
          a,
          e
        ) : c.identifyBy && w(
          t,
          i.alias,
          c.identifyBy,
          o.target,
          a,
          e
        );
        return;
      }
    }
    console.log(`Block ${o.blockKey} not found in destination config`);
    return;
  }
  const s = o.target.split(".");
  if (s.length === 1) {
    const i = s[0], c = t.find((r) => r.alias === i);
    if (c)
      if (e.has(i)) {
        const r = typeof c.value == "string" ? c.value : "";
        c.value = `${r} ${a}`;
      } else
        c.value = a;
    else
      t.push({ alias: i, value: a });
    e.add(i);
  } else if (s.length === 3) {
    const [i, c, r] = s, p = g(n).find((f) => f.key === i), u = p?.blocks.find((f) => f.key === c);
    if (!p || !u) return;
    const y = u.properties?.find((f) => f.key === r)?.alias ?? r;
    if (!u.identifyBy) return;
    w(
      t,
      p.alias,
      u.identifyBy,
      y,
      a,
      e
    );
  }
}
function w(t, o, l, n, e, a) {
  const s = t.find((i) => i.alias === o);
  if (!(!s || !s.value))
    try {
      const i = typeof s.value == "string", c = i ? JSON.parse(s.value) : s.value, r = c.contentData;
      if (!r) return;
      for (const p of r) {
        const u = p.values?.find((y) => y.alias === l.property);
        if (u && typeof u.value == "string" && u.value.toLowerCase().includes(l.value.toLowerCase())) {
          D(p, n, e, a);
          break;
        }
      }
      s.value = i ? JSON.stringify(c) : c;
    } catch (i) {
      console.error(`Failed to apply block mapping to ${o}:`, i);
    }
}
function K(t, o, l, n, e, a) {
  const s = t.find((i) => i.alias === o);
  if (!(!s || !s.value))
    try {
      const i = typeof s.value == "string", c = i ? JSON.parse(s.value) : s.value, r = c.contentData;
      if (!r) return;
      const p = r.find((u) => u.contentTypeKey === l);
      if (!p) return;
      D(p, n, e, a), s.value = i ? JSON.stringify(c) : c;
    } catch (i) {
      console.error(`Failed to apply block mapping by content type to ${o}:`, i);
    }
}
function D(t, o, l, n) {
  const e = `${t.key}:${o}`, a = t.values?.find((s) => s.alias === o);
  if (a)
    if (n.has(e)) {
      const s = typeof a.value == "string" ? a.value : "";
      a.value = `${s}
${l}`;
    } else
      a.value = l;
  else
    t.values = t.values ?? [], t.values.push({ alias: o, value: l });
  n.add(e);
}
function C(t, o, l) {
  for (const n of o.destination.fields)
    if (l.has(n.alias)) {
      if (n.type === "text" || n.type === "textArea") {
        const e = t.find((a) => a.alias === n.alias);
        e && typeof e.value == "string" && (e.value = $(e.value));
        continue;
      }
      if (n.type === "number") {
        const e = t.findIndex((a) => a.alias === n.alias);
        if (e !== -1 && typeof t[e].value == "string") {
          const a = U(t[e].value);
          a === null ? (console.warn(
            `UpDoc: could not coerce "${t[e].value}" to an integer for field "${n.alias}" — leaving property unset.`
          ), t.splice(e, 1)) : t[e].value = a;
        }
        continue;
      }
      if (n.type === "date") {
        const e = t.findIndex((a) => a.alias === n.alias);
        if (e !== -1 && typeof t[e].value == "string") {
          const a = L(t[e].value);
          a === null ? (console.warn(
            `UpDoc: could not coerce "${t[e].value}" to a date for field "${n.alias}" — leaving property unset.`
          ), t.splice(e, 1)) : t[e].value = B(a);
        }
        continue;
      }
      if (n.type === "richText") {
        const e = t.find((a) => a.alias === n.alias);
        e && typeof e.value == "string" && (e.value = h(T(e.value)));
      }
    }
  for (const n of g(o)) {
    const e = t.find((c) => c.alias === n.alias);
    if (!e?.value) continue;
    const a = typeof e.value == "string", s = a ? JSON.parse(e.value) : e.value, i = s.contentData;
    if (i) {
      for (const c of i)
        for (const r of n.blocks)
          if (r.contentTypeKey ? c.contentTypeKey === r.contentTypeKey : c.key === r.key) {
            for (const u of r.properties ?? []) {
              const y = `${c.key}:${u.alias}`;
              if (!l.has(y)) continue;
              const f = c.values?.find((d) => d.alias === u.alias);
              !f || typeof f.value != "string" || (u.type === "text" || u.type === "textArea" ? f.value = $(f.value) : u.type === "richText" && (f.value = h(T(f.value))));
            }
            break;
          }
      e.value = a ? JSON.stringify(s) : s;
    }
  }
}
function g(t) {
  return [...t.destination.blockGrids ?? [], ...t.destination.blockLists ?? []];
}
async function x(t) {
  try {
    const o = await t.json();
    return o?.title || o?.detail || `${t.status} ${t.statusText}`;
  } catch {
    return `${t.status} ${t.statusText}`;
  }
}
export {
  M as b,
  P as c
};
//# sourceMappingURL=create-from-source-Lr3UzQBc.js.map
