namespace TailoredTravel.Web.Helpers;

// Works out the Bootstrap display utility that collapses an EMPTY block-grid
// area while the grid is stacked, then shows it again once the area sits
// side-by-side.
//
// The area alias blob already encodes the responsive spec, e.g.
//   "primary g-col-12 g-col-md-8 g-col-lg-6 ..."
// Base is always g-col-12 (full-width / stacked). The FIRST prefixed span
// that drops below 12 is the breakpoint at which the area stops stacking.
// tertiary (g-col-md-4)  -> side-by-side at md  -> hide below md
// secondary (g-col-md-12 g-col-lg-3) -> full-width at md, splits at lg
//                                     -> hide below lg
//
// We read each area's OWN blob: Bootstrap places each grid item by its own
// g-col-* classes, so an area's stacking point is a property of that area,
// not of its siblings.
//
// Returns "d-none d-{bp}-block" when a stacking breakpoint exists, otherwise
// "" (an always-full-width area never goes side-by-side, so there is no
// phantom-row-vs-alignment tension to resolve).
public static class AreaStackHelper
{
    // Bootstrap breakpoint prefixes, smallest first. sm is omitted because
    // .grid areas start at g-col-12; the first split is authored at md+.
    private static readonly string[] Breakpoints = { "sm", "md", "lg", "xl", "xxl" };

    public static string EmptyStackedHide(string? areaAlias)
    {
        if (string.IsNullOrWhiteSpace(areaAlias)) return "";

        var tokens = areaAlias.Split(' ', System.StringSplitOptions.RemoveEmptyEntries);

        foreach (var bp in Breakpoints)
        {
            var prefix = $"g-col-{bp}-";
            var token = System.Array.Find(tokens, t => t.StartsWith(prefix, System.StringComparison.Ordinal));
            if (token == null) continue;

            if (int.TryParse(token[prefix.Length..], out var span) && span < 12)
            {
                return $"d-none d-{bp}-block";
            }
        }

        return "";
    }
}
