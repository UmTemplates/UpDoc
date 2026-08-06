using UpDoc.Models;

namespace UpDoc.Services;

/// <summary>
/// Turns transform sections into the lookups map.json addresses.
///
/// A mapping's source is a section id and a part - "features.content",
/// "accommodation.summary" - so the transform output has to be flattened into
/// that shape before mappings can resolve against it.
///
/// Mirrors buildSectionLookups in create-from-source.ts. The two must agree:
/// the backoffice builds these in the browser, this builds them on the server,
/// and the same map.json has to resolve either way.
/// </summary>
public static class SectionLookupBuilder
{
    /// <summary>
    /// Builds the section and stableKey lookups from a transform result.
    ///
    /// Excluded sections are skipped, so anything switched off in the
    /// Transformed view stays out of the created document.
    /// </summary>
    public static SectionLookups Build(TransformResult transform)
    {
        var sectionLookup = new Dictionary<string, string>(StringComparer.Ordinal);
        var stableKeyLookup = new Dictionary<string, string>(StringComparer.Ordinal);

        foreach (var section in transform.AllSections)
        {
            if (!section.Included)
                continue;

            if (!string.IsNullOrEmpty(section.Heading))
            {
                // On a role section the heading is a label ("Tour Title") rather
                // than document text, so both keys resolve to the content instead.
                var headingText = section.Pattern == "role" ? section.Content : section.Heading;

                // ".title" is the canonical key; ".heading" stays for existing maps.
                sectionLookup[$"{section.Id}.heading"] = headingText;
                sectionLookup[$"{section.Id}.title"] = headingText;
            }

            sectionLookup[$"{section.Id}.content"] = section.Content;

            if (!string.IsNullOrEmpty(section.Description))
                sectionLookup[$"{section.Id}.description"] = section.Description;

            if (!string.IsNullOrEmpty(section.Summary))
                sectionLookup[$"{section.Id}.summary"] = section.Summary;

            if (!string.IsNullOrEmpty(section.StableKey))
                stableKeyLookup[section.StableKey] = section.Id;
        }

        return new SectionLookups(sectionLookup, stableKeyLookup);
    }
}

/// <summary>
/// The two lookups a mapping run needs.
/// </summary>
/// <param name="SectionLookup">"sectionId.part" to text, e.g. "features.content".</param>
/// <param name="StableKeyLookup">stableKey to section id, for resolving mappings when section ids shift.</param>
public record SectionLookups(
    Dictionary<string, string> SectionLookup,
    Dictionary<string, string> StableKeyLookup);
