namespace InventorySystemServer.Data.Configurations
{
    using InventorySystemServer.Data.Models;

    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;

    public sealed class AppUserSettingsConfiguration : IEntityTypeConfiguration<AppUserSettings>
    {
        public void Configure(EntityTypeBuilder<AppUserSettings> entity)
        {
            entity.HasKey(appUserSettings => appUserSettings.UserId);
            entity.HasOne<AppUser>().WithMany()
                .HasForeignKey(appUserSettings => appUserSettings.UserId)
                .HasPrincipalKey(appUser => appUser.Id)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(appUserSettings => appUserSettings.Theme).HasConversion<string?>();
        }
    }
}