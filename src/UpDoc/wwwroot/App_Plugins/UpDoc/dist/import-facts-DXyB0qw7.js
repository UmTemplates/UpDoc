import { UmbModalToken as r } from "@umbraco-cms/backoffice/modal";
const c = new r(
  "UpDoc.Modal",
  {
    modal: {
      type: "sidebar",
      size: "medium"
    }
  }
);
function n(o) {
  return [
    {
      key: crypto.randomUUID(),
      mediaKey: o,
      mediaTypeAlias: "",
      crops: [],
      focalPoint: null
    }
  ];
}
function s(o, a, i) {
  if (a.blockKey) {
    console.warn(
      `UpDoc: import-fact mapping to a block property ("${a.target}") is not supported yet — skipped.`
    );
    return;
  }
  const e = n(i), t = o.find((p) => p.alias === a.target);
  t ? t.value = e : o.push({ alias: a.target, value: e });
}
export {
  c as U,
  s as a
};
//# sourceMappingURL=import-facts-DXyB0qw7.js.map
