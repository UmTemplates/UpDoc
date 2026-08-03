using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Web.Common.PublishedModels;

namespace TailoredTravel.Web.Helpers
{
    /// <summary>
    /// Reads the organisers off a tour.
    ///
    /// A tour can carry more than one organiser, and they may or may not belong to
    /// the same organisation: a single society will often name a lead contact and a
    /// deputy. The header shows the organisation ("The Arts Society Newbury
    /// presents") while the footer lists every named contact, so both need to agree
    /// on how organisers group. That logic lived inline in the organiser CTA view,
    /// which meant the header could not use it and simply took the first organiser
    /// and dropped the rest.
    ///
    /// Organisations are grouped by their typed name, so a misspelling produces two
    /// organisations rather than one. Accepted: the alternative is a library of
    /// organisations to pick from, which is work deferred until Umbraco ships
    /// reusable content.
    /// </summary>
    public static class TourOrganiserHelper
    {
        /// <summary>Every organiser on the tour, in order. Empty if none.</summary>
        public static IReadOnlyList<TourOrganiser> Organisers(IPublishedContent? content)
        {
            if (content is not ITourOrganisers tour || tour.Organisers is null)
                return Array.Empty<TourOrganiser>();

            return tour.Organisers
                .Select(b => b.Content)
                .OfType<TourOrganiser>()
                .ToList();
        }

        /// <summary>
        /// The organisers grouped by organisation, so one society with two contacts
        /// renders as a single heading with two people under it.
        /// </summary>
        public static IReadOnlyList<IGrouping<string, TourOrganiser>> ByOrganisation(IPublishedContent? content) =>
            Organisers(content)
                .GroupBy(o => o.OrganiserOrganisation ?? string.Empty)
                .ToList();

        /// <summary>The distinct organisation names, skipping any that are blank.</summary>
        public static IReadOnlyList<string> Organisations(IPublishedContent? content) =>
            Organisers(content)
                .Select(o => o.OrganiserOrganisation)
                .Where(n => !string.IsNullOrWhiteSpace(n))
                .Select(n => n!.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

        /// <summary>
        /// The organisation line for the page header, or an empty string when the
        /// tour has no organiser.
        ///
        ///   one:   "The Arts Society Newbury"
        ///   two:   "The Arts Society Newbury and The Arts Society Reading"
        ///   three: "A, B and C"
        ///
        /// The word "presents" is not included: the header sets that separately, and
        /// with two organisations it has to become "present".
        /// </summary>
        public static string OrganisationLine(IPublishedContent? content)
        {
            var names = Organisations(content);

            return names.Count switch
            {
                0 => string.Empty,
                1 => names[0],
                _ => string.Join(", ", names.Take(names.Count - 1)) + " and " + names[^1],
            };
        }

        /// <summary>"presents" for one organisation, "present" for more than one.</summary>
        public static string Presents(IPublishedContent? content) =>
            Organisations(content).Count > 1 ? "present" : "presents";
    }
}
