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
const a = "$sourceFile";
function o(t) {
  if (!t?.areas) return [];
  const e = [];
  for (const s of t.areas) {
    for (const n of s.groups)
      e.push(...n.sections);
    e.push(...s.sections);
  }
  return e;
}
export {
  a as I,
  o as a,
  c as b,
  r as g
};
//# sourceMappingURL=workflow.types-QrurYwv2.js.map
