namespace InventorySystemServer.WebApi.Areas.Identity.Pages.Account.Manage
{
    using System;
    using System.IO;

    using Microsoft.AspNetCore.Mvc.Rendering;

    public static class ManageNavPages
    {
        public static string Index { get; } = "Index";
        public static string Email { get; } = "Email";
        public static string ChangePassword { get; } = "ChangePassword";

        public static string? IndexNavClass(ViewContext viewContext) => PageNavClass(viewContext, Index);
        public static string? EmailNavClass(ViewContext viewContext) => PageNavClass(viewContext, Email);
        public static string? ChangePasswordNavClass(ViewContext viewContext) => PageNavClass(viewContext, ChangePassword);

        private static string? PageNavClass(ViewContext viewContext, string page)
        {
            var activePage = viewContext.ViewData["ActivePage"] as string
                ?? Path.GetFileNameWithoutExtension(viewContext.ActionDescriptor.DisplayName)!;
            return string.Equals(activePage, page, StringComparison.OrdinalIgnoreCase) ? "active" : null;
        }
    }
}