namespace TailoredTravel.Web.Helpers;

// Picker label → Bootstrap class mapping for the brand colour picker.
//
// The Colour Picker (ColourPickerBrand) stores a palette label
// (e.g. "blue", "white"). Brand colours (blue, coral, ...) are added to
// $theme-colors, so Bootstrap's utilities API generates matching .bg-,
// .text-bg-, .border-, and .btn- classes for them — those labels pass
// straight through.
//
// The neutrals (white, grey, black) are NOT in $theme-colors and must
// remap to Bootstrap's theme-aware surface tokens so they behave
// correctly in light and dark mode. A literal .bg-white would not flip.
//
// Each job (background, border, button) needs its own remap because
// Bootstrap uses different surface tokens per job:
//   white  → bg-body          / border-light     / btn-light
//   grey   → bg-body-secondary / border-secondary / btn-secondary
//   black  → bg-dark           / border-dark      / btn-dark
public static class PaletteClassHelper
{
    public static string Background(string? token) => token switch
    {
        null or "" => "",
        "white" => "bg-body",
        "grey"  => "bg-body-secondary",
        "black" => "bg-dark",
        "body"  => "bg-body",          // legacy label kept for existing content
        _       => $"text-bg-{token}",
    };

    public static string Border(string? token) => token switch
    {
        null or "" => "",
        "default" => "",               // plain .border — Bootstrap's --bs-border-color
        "white"   => "border-light",
        "grey"    => "border-secondary",
        "black"   => "border-dark",
        _         => $"border-{token}",
    };

    public static string Button(string? token) => token switch
    {
        null or "" => "",
        "white" => "btn-light",
        "grey"  => "btn-secondary",
        "black" => "btn-dark",
        _       => $"btn-{token}",
    };
}
