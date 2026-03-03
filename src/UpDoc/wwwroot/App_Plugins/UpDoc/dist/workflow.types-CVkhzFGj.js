function r(t) {
  if (t.exclude) return "exclude";
  if (t.part) return t.part;
  switch (t.action) {
    case "singleProperty":
    case "sectionProperty":
    case "sectionContent":
    case "addAsContent":
    case "addAsList":
      return "content";
    case "sectionTitle":
    case "createSection":
    case "setAsHeading":
      return "title";
    case "sectionDescription":
      return "description";
    case "sectionSummary":
      return "summary";
    case "exclude":
      return "exclude";
    default:
      return "content";
  }
}
function c(t) {
  return t.format ? t.format : t.action === "addAsList" ? "bulletListItem" : "auto";
}
function a(t) {
  if (!t?.areas) return [];
  const e = [];
  for (const n of t.areas) {
    for (const s of n.groups)
      e.push(...s.sections);
    e.push(...n.sections);
  }
  return e;
}
export {
  a,
  c as b,
  r as g
};
//# sourceMappingURL=workflow.types-CVkhzFGj.js.map
