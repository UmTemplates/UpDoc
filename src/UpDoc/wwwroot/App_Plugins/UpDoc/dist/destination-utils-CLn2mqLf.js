function s(n) {
  return [...n.blockGrids ?? [], ...n.blockLists ?? []];
}
function c(n) {
  return n.toLowerCase().replace(/\s+/g, "-");
}
function f(n) {
  const a = [], r = /* @__PURE__ */ new Set(), e = (o) => {
    const t = o ?? "Page Content";
    r.has(t) || (r.add(t), a.push({ id: c(t), label: t }));
  };
  for (const o of n.fields)
    o.tab && e(o.tab);
  for (const o of s(n))
    e(o.tab);
  return a;
}
function i(n, a) {
  const r = [], e = /* @__PURE__ */ new Map(), o = (t) => (e.has(t) || (e.set(t, { fields: [], containers: [] }), r.push(t)), e.get(t));
  for (const t of n.fields)
    !t.tab || c(t.tab) !== a || o(t.group ?? null).fields.push(t);
  for (const t of s(n))
    c(t.tab ?? "Page Content") === a && o(t.group ?? null).containers.push(t);
  return r.sort((t, l) => t === null ? -1 : l === null ? 1 : 0), r.map((t) => ({ group: t, ...e.get(t) }));
}
function u(n, a) {
  if (n.blockKey) {
    for (const e of s(a))
      if (e.blocks.find((o) => o.key === n.blockKey))
        return (e.tab ?? "Page Content").toLowerCase().replace(/\s+/g, "-");
    return "page-content";
  }
  const r = a.fields.find((e) => e.alias === n.target);
  return r?.tab ? r.tab.toLowerCase().replace(/\s+/g, "-") : null;
}
function b(n, a) {
  for (const r of s(a)) {
    const e = r.blocks.find((o) => o.key === n);
    if (e) return e.label;
  }
  return null;
}
export {
  b as a,
  f as b,
  i as c,
  s as g,
  u as r,
  c as t
};
//# sourceMappingURL=destination-utils-CLn2mqLf.js.map
