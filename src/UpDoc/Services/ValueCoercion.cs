using System.Globalization;
using System.Text.RegularExpressions;

namespace UpDoc.Services;

/// <summary>
/// Coerces captured text into the shapes Umbraco's property editors expect.
///
/// Extraction produces strings - "£1,199", "26th September 2026" - and a number
/// or date property will not accept them. Each coercion returns null rather than
/// guessing, so a field that cannot be parsed keeps its blueprint default
/// instead of storing something wrong.
///
/// Ported from transforms.ts. The two must agree: the backoffice coerces in the
/// browser, this coerces on the server, and both write to the same properties.
/// </summary>
public static partial class ValueCoercion
{
    /// <summary>
    /// Reads an integer out of captured text, stripping thousands separators and
    /// surrounding characters: "£1,199" becomes 1199.
    ///
    /// Returns null when no integer can be found.
    /// </summary>
    public static int? ToInteger(string? value)
    {
        if (string.IsNullOrEmpty(value))
            return null;

        var cleaned = value.Replace(",", string.Empty);
        var match = IntegerPattern().Match(cleaned);

        return match.Success && int.TryParse(match.Value, NumberStyles.Integer, CultureInfo.InvariantCulture, out var parsed)
            ? parsed
            : null;
    }

    /// <summary>
    /// Reads a date out of captured text, returning it as a DateOnly.
    ///
    /// Accepts named months in either order, with or without ordinal suffixes:
    /// "26th September 2027", "26 Sept 2027", "September 26 2027", and ISO input,
    /// which passes through validated.
    ///
    /// DELIBERATELY REFUSES all-numeric formats such as "06/07/2027". That is
    /// 6 July to a British reader and 7 June to an American one, and nothing in
    /// the source document says which. Guessing would write a wrong date that
    /// looks entirely valid, with no error to notice. Refusing leaves the field
    /// empty, which is visible. A future per-workflow date-format setting can
    /// enable these formats explicitly, rather than having to correct data
    /// already stored.
    /// </summary>
    public static DateOnly? ToDateOnly(string? value)
    {
        if (string.IsNullOrEmpty(value))
            return null;

        // Strip ordinal suffixes ("26th" becomes "26") so the number parses cleanly.
        var cleaned = OrdinalSuffixPattern().Replace(value.Trim(), "$1");

        // ISO first - already unambiguous, but still validated as a real date.
        var iso = IsoDatePattern().Match(cleaned);
        if (iso.Success)
        {
            return BuildDate(
                int.Parse(iso.Groups[1].Value, CultureInfo.InvariantCulture),
                int.Parse(iso.Groups[2].Value, CultureInfo.InvariantCulture),
                int.Parse(iso.Groups[3].Value, CultureInfo.InvariantCulture));
        }

        var dayFirst = DayFirstPattern().Match(cleaned);
        if (dayFirst.Success && TryMonthNumber(dayFirst.Groups[2].Value, out var dayFirstMonth))
        {
            return BuildDate(
                int.Parse(dayFirst.Groups[3].Value, CultureInfo.InvariantCulture),
                dayFirstMonth,
                int.Parse(dayFirst.Groups[1].Value, CultureInfo.InvariantCulture));
        }

        var monthFirst = MonthFirstPattern().Match(cleaned);
        if (monthFirst.Success && TryMonthNumber(monthFirst.Groups[1].Value, out var monthFirstMonth))
        {
            return BuildDate(
                int.Parse(monthFirst.Groups[3].Value, CultureInfo.InvariantCulture),
                monthFirstMonth,
                int.Parse(monthFirst.Groups[2].Value, CultureInfo.InvariantCulture));
        }

        // No named month found. Numeric-only input lands here and is refused.
        return null;
    }

    /// <summary>
    /// Wraps a date in the JSON shape Umbraco's date property editors persist.
    ///
    /// All four v17 date editors (DateOnly, DateTime, DateTimeUnspecified,
    /// DateTimeWithTimeZone) derive from DateTimePropertyEditorBase, which
    /// declares ValueType = ValueTypes.Json. A bare "2027-09-26" is therefore
    /// deserialised as JSON and rejected - the value must be this object.
    ///
    /// timeZone is null: the DateOnly editor ships with no configuration, so the
    /// TimeZoneMode.Custom validator does not apply.
    /// </summary>
    public static object BuildDateValue(DateOnly date) => new
    {
        date = date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
        timeZone = (string?)null,
    };

    /// <summary>
    /// Builds a date, or returns null when the parts do not describe a real one.
    ///
    /// Guards against dates that look plausible but do not exist ("31 February"),
    /// which a lenient parse would roll forward into March rather than rejecting.
    /// </summary>
    private static DateOnly? BuildDate(int year, int month, int day)
    {
        if (month is < 1 or > 12 || day is < 1 or > 31)
            return null;

        if (year < 1 || year > 9999 || day > DateTime.DaysInMonth(year, month))
            return null;

        return new DateOnly(year, month, day);
    }

    /// <summary>Month names and common abbreviations, to their 1-based month number.</summary>
    private static readonly Dictionary<string, int> MonthNames = new(StringComparer.OrdinalIgnoreCase)
    {
        ["january"] = 1, ["jan"] = 1,
        ["february"] = 2, ["feb"] = 2,
        ["march"] = 3, ["mar"] = 3,
        ["april"] = 4, ["apr"] = 4,
        ["may"] = 5,
        ["june"] = 6, ["jun"] = 6,
        ["july"] = 7, ["jul"] = 7,
        ["august"] = 8, ["aug"] = 8,
        ["september"] = 9, ["sept"] = 9, ["sep"] = 9,
        ["october"] = 10, ["oct"] = 10,
        ["november"] = 11, ["nov"] = 11,
        ["december"] = 12, ["dec"] = 12,
    };

    private static bool TryMonthNumber(string name, out int month)
        => MonthNames.TryGetValue(name, out month);

    /// <summary>Alternation of every recognised month name, longest first so "sept" wins over "sep".</summary>
    private static readonly string MonthPattern =
        string.Join("|", MonthNames.Keys.OrderByDescending(k => k.Length));

    [GeneratedRegex(@"-?\d+")]
    private static partial Regex IntegerPattern();

    [GeneratedRegex(@"(\d+)(st|nd|rd|th)\b", RegexOptions.IgnoreCase)]
    private static partial Regex OrdinalSuffixPattern();

    [GeneratedRegex(@"\b(\d{4})-(\d{1,2})-(\d{1,2})\b")]
    private static partial Regex IsoDatePattern();

    /// <summary>"26 September 2027" - day first.</summary>
    private static Regex DayFirstPattern() => new(
        $@"\b(\d{{1,2}})\s+({MonthPattern})\.?,?\s+(\d{{4}})\b",
        RegexOptions.IgnoreCase);

    /// <summary>"September 26 2027" / "September 26, 2027" - month first.</summary>
    private static Regex MonthFirstPattern() => new(
        $@"\b({MonthPattern})\.?\s+(\d{{1,2}}),?\s+(\d{{4}})\b",
        RegexOptions.IgnoreCase);
}
