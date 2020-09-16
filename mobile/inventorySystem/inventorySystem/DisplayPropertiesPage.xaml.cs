using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace inventorySystem
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class DisplayPropertiesPage : ContentPage
    {
        public DisplayPropertiesPage(string[] prop)
        {   
            InitializeComponent();

            labBar.Text = prop[0];
            labAssigned.Text = prop[1];
            labCat.Text = prop[2];
            labCost.Text = prop[3];
            labBuild.Text = prop[4];
            labFloor.Text = prop[5];
            labRoom.Text = prop[6];
            labName.Text = prop[7];
            labFlag.Text = prop[8];
            labAcquired.Text = prop[9];
            labSurplussed.Text = prop[10];

            if (labFlag.Text == "F")
            {
                flag.IsVisible = false;
                unflag.IsVisible = true;
            }
            else
            {
                flag.IsVisible = true;
                unflag.IsVisible = false;
            }
        }

 
        private async void flagButton_OnClick(object sender, EventArgs e)
        {
            labFlag.Text = "F";
            string[] p = { labBar.Text, labAssigned.Text, labCat.Text, labCost.Text,
                labBuild.Text, labFloor.Text, labRoom.Text, labName.Text, labFlag.Text, labAcquired.Text, labSurplussed.Text };

            await writeFile(p);
            flag.IsVisible = false;
            unflag.IsVisible = true;
            await DisplayAlert("Flag", "Item has been flagged", "OK");
        }
        private async void unflagButton_OnClick(object sender, EventArgs e)
        {
            labFlag.Text = "UF";
            string[] p = { labBar.Text, labAssigned.Text, labCat.Text, labCost.Text,
                labBuild.Text, labFloor.Text, labRoom.Text, labName.Text, labFlag.Text, labAcquired.Text, labSurplussed.Text };

            await writeFile(p);
            flag.IsVisible = true;
            unflag.IsVisible = false;
            await DisplayAlert("Flag", "Item has been unflagged", "OK");
        }
        private async void editPropertiesButton_OnClick(object sender, EventArgs e) 
        {
            string[] p = { labBar.Text, labAssigned.Text, labCat.Text, labCost.Text, labBuild.Text, labFloor.Text, labRoom.Text, labName.Text, labFlag.Text, labAcquired.Text, labSurplussed.Text };

            await Navigation.PushAsync(new EditPropertiesPage(p));
        }
        private async void trackLocationButton_OnClick(object sender, EventArgs e)
        {
            await Navigation.PushAsync(new TrackLocationPage());
        }
        public async Task writeFile(string[] l)
        {
            string fileName = Path.Combine(System.Environment.GetFolderPath(System.Environment.SpecialFolder.Personal), "database.txt");
            //DisplayAlert(fileName, "Item has been saved", "OK");
            using (var writer = File.CreateText(fileName))
            {
                await writer.WriteLineAsync(l[0] + "," + l[1] + "," + l[2] + "," + l[3] + "," + l[4] + "," + l[5] + "," + l[6] + "," + l[7] + "," + l[8] + "," + l[9] + "," + l[10]);

                /*await writer.WriteLineAsync("12345,Grant,Appliance,500,Upson I,2,121,Name,F,DA,DS");
                await writer.WriteLineAsync("123456,Marsh,Furniture,200,Upson II,1,122,Name,F,DA,DS");
                await writer.WriteLineAsync("123457,Grant,Appliance,700,Harrington,3,123,Name,F,DA,DS");
                await writer.WriteLineAsync("12346,Marsh,Electronic,300,CEC,2,112,Name,F,DA,DS");*/
            }

        }
    }
}