namespace TailoredTravel.Web.Helpers
{
    public static class GridColumnsHelper
    {
        public static string ClassesFor(int columnsWide) => columnsWide switch
        {
            1 => "g-col-12",
            2 => "g-col-12 g-col-md-6",
            3 => "g-col-12 g-col-md-6 g-col-lg-4",
            4 => "g-col-12 g-col-md-6 g-col-lg-4 g-col-xl-3",
            _ => "g-col-12 g-col-md-6 g-col-lg-4",
        };
    }
}
