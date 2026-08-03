function c(o) {
  return [...o.blockGrids ?? [], ...o.blockLists ?? []];
}
function f(o) {
  return o.toLowerCase().replace(/\s+/g, "-");
}
function i(o) {
  const t = [], r = /* @__PURE__ */ new Set(), e = (n) => {
    const a = n ?? "Page Content";
    r.has(a) || (r.add(a), t.push({ id: f(a), label: a }));
  }, s = /* @__PURE__ */ new Set();
  for (const n of o.fields)
    n.tab && s.add(n.tab);
  for (const n of c(o))
    s.add(n.tab ?? "Page Content");
  for (const n of o.tabOrder ?? [])
    s.has(n) && e(n);
  for (const n of o.fields)
    n.tab && e(n.tab);
  for (const n of c(o))
    e(n.tab);
  return t;
}
function b(o, t) {
  const r = [], e = /* @__PURE__ */ new Map(), s = (n) => (e.has(n) || (e.set(n, { fields: [], containers: [] }), r.push(n)), e.get(n));
  for (const n of o.fields)
    !n.tab || f(n.tab) !== t || s(n.group ?? null).fields.push(n);
  for (const n of c(o))
    f(n.tab ?? "Page Content") === t && s(n.group ?? null).containers.push(n);
  return u(r, o, t).map((n) => ({
    group: n,
    ...e.get(n)
  }));
}
function u(o, t, r) {
  const e = (t.tabOrder ?? []).find((a) => f(a) === r) ?? t.fields.find((a) => a.tab && f(a.tab) === r)?.tab, s = (e ? t.groupOrder?.[e] : void 0) ?? [], n = (a) => {
    if (a === null) return -1;
    const l = s.indexOf(a);
    return l === -1 ? Number.MAX_SAFE_INTEGER : l;
  };
  return [...o].sort((a, l) => n(a) - n(l));
}
function d(o, t) {
  if (o.blockKey) {
    for (const e of c(t))
      if (e.blocks.find((s) => s.key === o.blockKey))
        return (e.tab ?? "Page Content").toLowerCase().replace(/\s+/g, "-");
    return "page-content";
  }
  const r = t.fields.find((e) => e.alias === o.target);
  return r?.tab ? r.tab.toLowerCase().replace(/\s+/g, "-") : null;
}
function k(o, t) {
  if (o.blockKey) {
    for (const r of c(t))
      if (r.blocks.find((e) => e.key === o.blockKey))
        return r.group ?? null;
    return null;
  }
  return t.fields.find((r) => r.alias === o.target)?.group ?? null;
}
function p(o, t) {
  for (const r of c(t)) {
    const e = r.blocks.find((s) => s.key === o);
    if (e) return e.label;
  }
  return null;
}
export {
  k as a,
  p as b,
  i as c,
  b as d,
  c as g,
  d as r,
  u as s,
  f as t
};
//# sourceMappingURL=destination-utils-BFSWOBvb.js.map
