import { UmbModalToken as O } from "@umbraco-cms/backoffice/modal";
import { I as V } from "./workflow.types-QrurYwv2.js";
import { s as w, c as B, a as I, b as J, d as T, m as h } from "./transforms-qqnY8EQ-.js";
const _ = new O(
  "UpDoc.Modal",
  {
    modal: {
      type: "sidebar",
      size: "medium"
    }
  }
);
function L(e) {
  return [
    {
      key: crypto.randomUUID(),
      mediaKey: e,
      mediaTypeAlias: "",
      crops: [],
      focalPoint: null
    }
  ];
}
function M(e, a, u) {
  if (a.blockKey) {
    console.warn(
      `UpDoc: import-fact mapping to a block property ("${a.target}") is not supported yet — skipped.`
    );
    return;
  }
  const c = L(u), t = e.find((n) => n.alias === a.target);
  t ? t.value = c : e.push({ alias: a.target, value: c });
}
async function E(e) {
  const {
    parentUnique: a,
    documentTypeUnique: u,
    blueprintUnique: c,
    name: t,
    mediaUnique: n,
    sectionLookup: s,
    stableKeyLookup: o,
    config: i,
    fetchFn: r,
    token: p
  } = e, l = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${p}`
  }, y = await r(
    `/umbraco/management/api/v1/document-blueprint/${c}/scaffold`,
    { method: "GET", headers: l }
  );
  if (!y.ok)
    return { ok: !1, stage: "scaffold", message: await K(y) };
  const f = await y.json(), d = f.values ? JSON.parse(JSON.stringify(f.values)) : [];
  N(d, { sectionLookup: s, stableKeyLookup: o, config: i, mediaUnique: n });
  const x = {
    parent: a ? { id: a } : null,
    documentType: { id: u },
    template: f.template ? { id: f.template.id } : null,
    values: d,
    variants: [{ name: t, culture: null, segment: null }]
  }, k = await r("/umbraco/management/api/v1/document", {
    method: "POST",
    headers: l,
    body: JSON.stringify(x)
  });
  if (!k.ok)
    return { ok: !1, stage: "create", message: await K(k) };
  const m = k.headers.get("Location")?.split("/").pop();
  if (m) {
    const v = await r(`/umbraco/management/api/v1/document/${m}`, {
      method: "GET",
      headers: l
    });
    if (v.ok) {
      const S = await v.json(), b = await r(`/umbraco/management/api/v1/document/${m}`, {
        method: "PUT",
        headers: l,
        body: JSON.stringify(S)
      });
      b.ok || console.warn("UpDoc: document created, but the follow-up save failed:", await b.text());
    } else
      console.warn("UpDoc: document created, but could not be read back for saving:", await v.text());
  }
  return { ok: !0, documentId: m };
}
function N(e, a) {
  const { sectionLookup: u, stableKeyLookup: c, config: t, mediaUnique: n } = a, s = /* @__PURE__ */ new Set();
  for (const o of t.map.mappings) {
    if (o.enabled === !1) continue;
    if (o.source === V) {
      if (!n) continue;
      for (const r of o.destinations)
        M(e, r, n);
      continue;
    }
    let i = u[o.source];
    if (!i && o.sourceKey && c) {
      const r = c[o.sourceKey];
      if (r) {
        const p = o.source.split(".").pop();
        p && (i = u[`${r}.${p}`]);
      }
    }
    if (i)
      for (const r of o.destinations)
        C(e, r, i, t, s);
  }
  R(e, t, s);
}
function C(e, a, u, c, t) {
  const n = u;
  if (a.contentTypeKey) {
    for (const o of g(c))
      D(
        e,
        o.alias,
        a.contentTypeKey,
        a.target,
        n,
        t
      );
    return;
  }
  if (a.blockKey) {
    for (const o of g(c)) {
      const i = o.blocks.find((r) => r.key === a.blockKey);
      if (i) {
        i.contentTypeKey ? D(
          e,
          o.alias,
          i.contentTypeKey,
          a.target,
          n,
          t
        ) : i.identifyBy && $(
          e,
          o.alias,
          i.identifyBy,
          a.target,
          n,
          t
        );
        return;
      }
    }
    console.log(`Block ${a.blockKey} not found in destination config`);
    return;
  }
  const s = a.target.split(".");
  if (s.length === 1) {
    const o = s[0], i = e.find((r) => r.alias === o);
    if (i)
      if (t.has(o)) {
        const r = typeof i.value == "string" ? i.value : "";
        i.value = `${r} ${n}`;
      } else
        i.value = n;
    else
      e.push({ alias: o, value: n });
    t.add(o);
  } else if (s.length === 3) {
    const [o, i, r] = s, p = g(c).find((f) => f.key === o), l = p?.blocks.find((f) => f.key === i);
    if (!p || !l) return;
    const y = l.properties?.find((f) => f.key === r)?.alias ?? r;
    if (!l.identifyBy) return;
    $(
      e,
      p.alias,
      l.identifyBy,
      y,
      n,
      t
    );
  }
}
function $(e, a, u, c, t, n) {
  const s = e.find((o) => o.alias === a);
  if (!(!s || !s.value))
    try {
      const o = typeof s.value == "string", i = o ? JSON.parse(s.value) : s.value, r = i.contentData;
      if (!r) return;
      for (const p of r) {
        const l = p.values?.find((y) => y.alias === u.property);
        if (l && typeof l.value == "string" && l.value.toLowerCase().includes(u.value.toLowerCase())) {
          U(p, c, t, n);
          break;
        }
      }
      s.value = o ? JSON.stringify(i) : i;
    } catch (o) {
      console.error(`Failed to apply block mapping to ${a}:`, o);
    }
}
function D(e, a, u, c, t, n) {
  const s = e.find((o) => o.alias === a);
  if (!(!s || !s.value))
    try {
      const o = typeof s.value == "string", i = o ? JSON.parse(s.value) : s.value, r = i.contentData;
      if (!r) return;
      const p = r.find((l) => l.contentTypeKey === u);
      if (!p) return;
      U(p, c, t, n), s.value = o ? JSON.stringify(i) : i;
    } catch (o) {
      console.error(`Failed to apply block mapping by content type to ${a}:`, o);
    }
}
function U(e, a, u, c) {
  const t = `${e.key}:${a}`, n = e.values?.find((s) => s.alias === a);
  if (n)
    if (c.has(t)) {
      const s = typeof n.value == "string" ? n.value : "";
      n.value = `${s}
${u}`;
    } else
      n.value = u;
  else
    e.values = e.values ?? [], e.values.push({ alias: a, value: u });
  c.add(t);
}
function R(e, a, u) {
  for (const c of a.destination.fields)
    if (u.has(c.alias)) {
      if (c.type === "text" || c.type === "textArea") {
        const t = e.find((n) => n.alias === c.alias);
        t && typeof t.value == "string" && (t.value = w(t.value));
        continue;
      }
      if (c.type === "number") {
        const t = e.findIndex((n) => n.alias === c.alias);
        if (t !== -1 && typeof e[t].value == "string") {
          const n = B(e[t].value);
          n === null ? (console.warn(
            `UpDoc: could not coerce "${e[t].value}" to an integer for field "${c.alias}" — leaving property unset.`
          ), e.splice(t, 1)) : e[t].value = n;
        }
        continue;
      }
      if (c.type === "date") {
        const t = e.findIndex((n) => n.alias === c.alias);
        if (t !== -1 && typeof e[t].value == "string") {
          const n = I(e[t].value);
          n === null ? (console.warn(
            `UpDoc: could not coerce "${e[t].value}" to a date for field "${c.alias}" — leaving property unset.`
          ), e.splice(t, 1)) : e[t].value = J(n);
        }
        continue;
      }
      if (c.type === "richText") {
        const t = e.find((n) => n.alias === c.alias);
        t && typeof t.value == "string" && (t.value = T(h(t.value)));
      }
    }
  for (const c of g(a)) {
    const t = e.find((i) => i.alias === c.alias);
    if (!t?.value) continue;
    const n = typeof t.value == "string", s = n ? JSON.parse(t.value) : t.value, o = s.contentData;
    if (o) {
      for (const i of o)
        for (const r of c.blocks)
          if (r.contentTypeKey ? i.contentTypeKey === r.contentTypeKey : i.key === r.key) {
            for (const l of r.properties ?? []) {
              const y = `${i.key}:${l.alias}`;
              if (!u.has(y)) continue;
              const f = i.values?.find((d) => d.alias === l.alias);
              !f || typeof f.value != "string" || (l.type === "text" || l.type === "textArea" ? f.value = w(f.value) : l.type === "richText" && (f.value = T(h(f.value))));
            }
            break;
          }
      t.value = n ? JSON.stringify(s) : s;
    }
  }
}
function g(e) {
  return [...e.destination.blockGrids ?? [], ...e.destination.blockLists ?? []];
}
async function K(e) {
  try {
    const a = await e.json();
    return a?.title || a?.detail || `${e.status} ${e.statusText}`;
  } catch {
    return `${e.status} ${e.statusText}`;
  }
}
export {
  _ as U,
  E as c
};
//# sourceMappingURL=create-from-source-IxHUduRB.js.map
