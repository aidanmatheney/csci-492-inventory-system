using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace InventorySystemServer.Data.Migrations
{
    public partial class CreateInventoryTables : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "InventoryAssignees",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventoryAssignees", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "InventoryItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Barcode = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventoryItems", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "InventoryAssigneeSnapshots",
                columns: table => new
                {
                    AssigneeId = table.Column<int>(type: "integer", nullable: false),
                    Sequence = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventoryAssigneeSnapshots", x => new { x.AssigneeId, x.Sequence });
                    table.ForeignKey(
                        name: "FK_InventoryAssigneeSnapshots_InventoryAssignees_AssigneeId",
                        column: x => x.AssigneeId,
                        principalTable: "InventoryAssignees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InventoryItemSnapshots",
                columns: table => new
                {
                    ItemId = table.Column<int>(type: "integer", nullable: false),
                    Sequence = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Category = table.Column<string>(type: "text", nullable: true),
                    Cost = table.Column<decimal>(type: "numeric", nullable: true),
                    Building = table.Column<string>(type: "text", nullable: true),
                    Floor = table.Column<string>(type: "text", nullable: true),
                    Room = table.Column<string>(type: "text", nullable: true),
                    AcquiredDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    SurplussedDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    AssigneeId = table.Column<int>(type: "integer", nullable: true),
                    FlaggedReason = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventoryItemSnapshots", x => new { x.ItemId, x.Sequence });
                    table.ForeignKey(
                        name: "FK_InventoryItemSnapshots_InventoryAssignees_AssigneeId",
                        column: x => x.AssigneeId,
                        principalTable: "InventoryAssignees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InventoryItemSnapshots_InventoryItems_ItemId",
                        column: x => x.ItemId,
                        principalTable: "InventoryItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InventoryAssigneeChanges",
                columns: table => new
                {
                    AssigneeId = table.Column<int>(type: "integer", nullable: false),
                    Sequence = table.Column<int>(type: "integer", nullable: false),
                    NewSnapshotSequence = table.Column<int>(type: "integer", nullable: true),
                    UserId = table.Column<string>(type: "text", nullable: true),
                    Date = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Approved = table.Column<bool>(type: "boolean", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventoryAssigneeChanges", x => new { x.AssigneeId, x.Sequence });
                    table.ForeignKey(
                        name: "FK_InventoryAssigneeChanges_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_InventoryAssigneeChanges_InventoryAssignees_AssigneeId",
                        column: x => x.AssigneeId,
                        principalTable: "InventoryAssignees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InventoryAssigneeChanges_InventoryAssigneeSnapshots_Assigne~",
                        columns: x => new { x.AssigneeId, x.NewSnapshotSequence },
                        principalTable: "InventoryAssigneeSnapshots",
                        principalColumns: new[] { "AssigneeId", "Sequence" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "InventoryItemChanges",
                columns: table => new
                {
                    ItemId = table.Column<int>(type: "integer", nullable: false),
                    Sequence = table.Column<int>(type: "integer", nullable: false),
                    NewSnapshotSequence = table.Column<int>(type: "integer", nullable: true),
                    UserId = table.Column<string>(type: "text", nullable: true),
                    Date = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Approved = table.Column<bool>(type: "boolean", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventoryItemChanges", x => new { x.ItemId, x.Sequence });
                    table.ForeignKey(
                        name: "FK_InventoryItemChanges_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_InventoryItemChanges_InventoryItems_ItemId",
                        column: x => x.ItemId,
                        principalTable: "InventoryItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InventoryItemChanges_InventoryItemSnapshots_ItemId_NewSnaps~",
                        columns: x => new { x.ItemId, x.NewSnapshotSequence },
                        principalTable: "InventoryItemSnapshots",
                        principalColumns: new[] { "ItemId", "Sequence" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_InventoryAssigneeChanges_AssigneeId_NewSnapshotSequence",
                table: "InventoryAssigneeChanges",
                columns: new[] { "AssigneeId", "NewSnapshotSequence" });

            migrationBuilder.CreateIndex(
                name: "IX_InventoryAssigneeChanges_UserId",
                table: "InventoryAssigneeChanges",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryItemChanges_ItemId_NewSnapshotSequence",
                table: "InventoryItemChanges",
                columns: new[] { "ItemId", "NewSnapshotSequence" });

            migrationBuilder.CreateIndex(
                name: "IX_InventoryItemChanges_UserId",
                table: "InventoryItemChanges",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryItems_Barcode",
                table: "InventoryItems",
                column: "Barcode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InventoryItemSnapshots_AssigneeId",
                table: "InventoryItemSnapshots",
                column: "AssigneeId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InventoryAssigneeChanges");

            migrationBuilder.DropTable(
                name: "InventoryItemChanges");

            migrationBuilder.DropTable(
                name: "InventoryAssigneeSnapshots");

            migrationBuilder.DropTable(
                name: "InventoryItemSnapshots");

            migrationBuilder.DropTable(
                name: "InventoryAssignees");

            migrationBuilder.DropTable(
                name: "InventoryItems");
        }
    }
}
