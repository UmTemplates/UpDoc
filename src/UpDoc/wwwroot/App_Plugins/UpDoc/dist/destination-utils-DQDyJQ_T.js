function l(o) {
  return [...o.blockGrids ?? [], ...o.blockLists ?? []];
}
function c(o) {
  return o.toLowerCase().replace(/\s+/g, "-");
}
function f(o) {
  const r = [], e = /* @__PURE__ */ new Set(), t = (n) => {
    const s = n ?? "Page Content";
    e.has(s) || (e.add(s), r.push({ id: c(s), label: s }));
  }, a = /* @__PURE__ */ new Set();
  for (const n of o.fields)
    n.tab && a.add(n.tab);
  for (const n of l(o))
    a.add(n.tab ?? "Page Content");
  for (const n of o.tabOrder ?? [])
    a.has(n) && t(n);
  for (const n of o.fields)
    n.tab && t(n.tab);
  for (const n of l(o))
    t(n.tab);
  return r;
}
function i(o, r) {
  const e = [], t = /* @__PURE__ */ new Map(), a = (n) => (t.has(n) || (t.set(n, { fields: [], containers: [] }), e.push(n)), t.get(n));
  for (const n of o.fields)
    !n.tab || c(n.tab) !== r || a(n.group ?? null).fields.push(n);
  for (const n of l(o))
    c(n.tab ?? "Page Content") === r && a(n.group ?? null).containers.push(n);
  return e.sort((n, s) => n === null ? -1 : s === null ? 1 : 0), e.map((n) => ({ group: n, ...t.get(n) }));
}
function u(o, r) {
  if (o.blockKey) {
    for (const t of l(r))
      if (t.blocks.find((a) => a.key === o.blockKey))
        return (t.tab ?? "Page Content").toLowerCase().replace(/\s+/g, "-");
    return "page-content";
  }
  const e = r.fields.find((t) => t.alias === o.target);
  return e?.tab ? e.tab.toLowerCase().replace(/\s+/g, "-") : null;
}
function b(o, r) {
  if (o.blockKey) {
    for (const e of l(r))
      if (e.blocks.find((t) => t.key === o.blockKey))
        return e.group ?? null;
    return null;
  }
  return r.fields.find((e) => e.alias === o.target)?.group ?? null;
}
function d(o, r) {
  for (const e of l(r)) {
    const t = e.blocks.find((a) => a.key === o);
    if (t) return t.label;
  }
  return null;
}
export {
  b as a,
  d as b,
  f as c,
  i as d,
  l as g,
  u as r,
  c as t
};
//# sourceMappingURL=destination-utils-DQDyJQ_T.js.map
