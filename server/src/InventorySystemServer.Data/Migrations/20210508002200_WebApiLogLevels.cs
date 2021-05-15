using Microsoft.EntityFrameworkCore.Migrations;

namespace InventorySystemServer.Data.Migrations
{
    public partial class WebApiLogLevels : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WebApiLogLevels",
                columns: table => new
                {
                    Name = table.Column<string>(type: "text", nullable: false),
                    Ordinal = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WebApiLogLevels", x => x.Name);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WebApiLogLevels_Ordinal",
                table: "WebApiLogLevels",
                column: "Ordinal",
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WebApiLogLevels");
        }
    }
}
