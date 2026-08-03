using System.Globalization;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Extensions;

namespace TailoredTravel.Web.Helpers
{
    /// <summary>
    /// Builds the tour "strapline": the one-line summary of a tour's details,
    /// e.g. "5 days from £779" or "6 days from £1,899, departing 18 October 2026".
    ///
    /// These details used to be typed by hand into Page Description on every tour,
    /// which meant the same sentence was duplicated across the page heading, the
    /// "Tailor your tour" CTA and the tour cards, and could not be reworded
    /// without editing every page. They are now structured properties
    /// (see issue #686), and this helper is the single place that formats them.
    ///
    /// The properties are shared by Group, Individual and Tailored tours via
    /// separate compositions, so there is no common interface to bind to. The
    /// helper reads by alias off IPublishedContent instead, which means one
    /// method serves all three types and simply omits whatever is absent.
    /// </summary>
    public static class TourDetailsHelper
    {
        private const string DurationAlias = "pagePropertyTourDuration";
        private const string PriceAlias = "pagePropertyTourPriceFrom";
        private const string DepartureAlias = "pagePropertyTourDepartureDate";

        /// <summary>
        /// The tour details as a single line, or an empty string when the tour has
        /// none. Never returns a partial or nonsense line.
        /// </summary>
        /// <param name="content">The tour page.</param>
        /// <param name="perPerson">Append "per person" to the price.</param>
        public static string Strapline(IPublishedContent? content, bool perPerson = false)
        {
            if (content is null) return string.Empty;

            var duration = Duration(content);
            var price = Price(content);
            var departure = Departure(content);

            // A tour with neither a duration nor a price has nothing to say.
            // Returning "" (rather than "0 days from £0") lets the caller test
            // the result and render nothing at all.
            if (duration is null && price is null) return string.Empty;

            var parts = new List<string>();

            if (duration is not null)
            {
                parts.Add($"{duration} {(duration == 1 ? "day" : "days")}");
            }

            if (price is not null)
            {
                var formatted = FormatPrice(price.Value);
                var from = duration is not null ? "from " : "From ";
                parts.Add($"{from}{formatted}{(perPerson ? " per person" : "")}");
            }

            var line = string.Join(" ", parts);

            if (departure is not null)
            {
                line += $", departing {departure.Value:d MMMM yyyy}";
            }

            return line;
        }

        /// <summary>True when the tour has enough details to render a strapline.</summary>
        public static bool HasDetails(IPublishedContent? content) =>
            !string.IsNullOrEmpty(Strapline(content));

        /// <summary>
        /// The strapline for backoffice preview, with a bracketed placeholder in
        /// place of each property that the tour type has but has not filled in.
        /// e.g. "5 days [Tour Price (from)], departing 18 October 2026".
        ///
        /// Only ever shown in Block Preview — never on a live page, where an
        /// unfilled property renders nothing at all.
        ///
        /// Placeholders are per-property rather than all-or-nothing so a tour with
        /// a duration and price but no departure date still shows the gap. Absent
        /// properties are distinguished from empty ones with HasProperty, so a
        /// Group Tour (which has no departure date at all) never advertises one.
        /// </summary>
        public static string PreviewStrapline(IPublishedContent? content)
        {
            if (content is null) return string.Empty;

            var parts = new List<string>();

            var duration = Duration(content);
            if (duration is not null)
            {
                parts.Add($"{duration} {(duration == 1 ? "day" : "days")}");
            }
            else if (content.HasProperty(DurationAlias))
            {
                parts.Add("[Tour Duration]");
            }

            var price = Price(content);
            if (price is not null)
            {
                var from = parts.Count > 0 ? "from " : "From ";
                parts.Add($"{from}{FormatPrice(price.Value)}");
            }
            else if (content.HasProperty(PriceAlias))
            {
                parts.Add("[Tour Price (from)]");
            }

            var line = string.Join(" ", parts);

            var departure = Departure(content);
            if (departure is not null)
            {
                line += $", departing {departure.Value:d MMMM yyyy}";
            }
            else if (content.HasProperty(DepartureAlias))
            {
                line += line.Length > 0 ? ", [Tour Departure Date]" : "[Tour Departure Date]";
            }

            return line;
        }

        /// <summary>
        /// Number of days, or null when unset.
        ///
        /// ModelsBuilder types this property as a non-nullable int, so an unset
        /// value arrives as 0 rather than null. A zero-day tour is nonsense, so
        /// 0 is treated as "not set".
        /// </summary>
        public static int? Duration(IPublishedContent? content)
        {
            var days = content?.Value<int>(DurationAlias) ?? 0;
            return days > 0 ? days : null;
        }

        /// <summary>Starting price, or null when unset. Zero is treated as "not set".</summary>
        public static decimal? Price(IPublishedContent? content)
        {
            var price = content?.Value<decimal>(PriceAlias) ?? 0m;
            return price > 0m ? price : null;
        }

        /// <summary>
        /// Departure date, or null. Only Tailored Tours carry one.
        ///
        /// The property editor is Umbraco.DateOnly, so the value is a DateOnly,
        /// not a DateTime. Asking for the wrong type returns default and the date
        /// silently vanishes from the strapline.
        /// </summary>
        public static DateOnly? Departure(IPublishedContent? content)
        {
            if (content is null || !content.HasValue(DepartureAlias)) return null;

            var date = content.Value<DateOnly?>(DepartureAlias);
            return date == default(DateOnly) ? null : date;
        }

        /// <summary>
        /// "£1,199", or "£1,199.50" if the price genuinely has pence.
        /// Prices are whole pounds in practice, so trailing ".00" is dropped.
        /// </summary>
        private static string FormatPrice(decimal price)
        {
            var uk = CultureInfo.GetCultureInfo("en-GB");
            return price == decimal.Truncate(price)
                ? price.ToString("C0", uk)
                : price.ToString("C", uk);
        }
    }
}
