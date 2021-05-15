using Microsoft.EntityFrameworkCore.Migrations;

namespace InventorySystemServer.Data.Migrations
{
    public partial class WebApiLogEntryFkToLogLevel : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_WebApiLogEntries_LogLevel",
                table: "WebApiLogEntries",
                column: "LogLevel");

            migrationBuilder.AddForeignKey(
                name: "FK_WebApiLogEntries_WebApiLogLevels_LogLevel",
                table: "WebApiLogEntries",
                column: "LogLevel",
                principalTable: "WebApiLogLevels",
                principalColumn: "Name",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WebApiLogEntries_WebApiLogLevels_LogLevel",
                table: "WebApiLogEntries");

            migrationBuilder.DropIndex(
                name: "IX_WebApiLogEntries_LogLevel",
                table: "WebApiLogEntries");
        }
    }
}
