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
    public partial class EditPropertiesPage : ContentPage
    {
        public EditPropertiesPage(string[] BC)
        {
            InitializeComponent();

            Category.Items.Add(" ");
            Category.Items.Add("Appliance");
            Category.Items.Add("Electronic");
            Category.Items.Add("Furniture");
            Category.Items.Add("Fixture");
            //others

            Building.Items.Add(" ");
            Building.Items.Add("Upson I");
            Building.Items.Add("Upson II");
            Building.Items.Add("Harrington Hall");
            Building.Items.Add("CEC");
            Building.Items.Add("Leonard Hall");

            Floor.Items.Add("");

            labBar.Text = BC[0];

            labFlag.Text = "UF";

            if (BC[1] != null)
            {
                entAssigned.Text = BC[1];
                Category.SelectedItem = BC[2];
                entCost.Text = BC[3];
                Building.SelectedItem = BC[4];
                Floor.SelectedItem = BC[5];
                entRoom.Text = BC[6];
                entName.Text = BC[7];
                labFlag.Text = BC[8];
                entAcquired.Text = BC[9];
                entSurplussed.Text = BC[10];
            }
            else
            {
                entSurplussed.Text = "N/A";
            }
        }

        private void Category_OnSelectedIndexChanged(object sender, EventArgs e)
        {
            var cat = Category.Items[Category.SelectedIndex];
            //DisplayAlert(cat, "Selected category", "OK");
        }

        private async void flagButton_OnClick(object sender, EventArgs e)
        {
            labFlag.Text = "F";
            await DisplayAlert("Flag", "Item has been flagged", "OK");
        }
        private async void savePropertiesButton_OnClick(object sender, EventArgs e)
        {
            string[] p = { labBar.Text, entAssigned.Text, Category.SelectedItem.ToString(), entCost.Text, 
                Building.SelectedItem.ToString(), Floor.SelectedItem.ToString(), entRoom.Text, entName.Text, labFlag.Text,
                entAcquired.Text, entSurplussed.Text };

            await writeFile(p);
            await DisplayAlert("Saved", "Item has been saved", "OK");
            await Navigation.PushAsync(new ScannerPage());
        }

        private void Building_SelectedIndexChanged(object sender, EventArgs e)
        {
            var build = Building.Items[Building.SelectedIndex];
            
            //DisplayAlert(build, "Selected building", "OK");

            Floor.SelectedIndex = 0;

            var count = Floor.Items.Count();
            
            if (count != 1)
            {
                for (var x = count - 1; x > 0; x--) //removes all items/indexes excpet for the first one which is empty
                {
                    Floor.Items.RemoveAt(x);
                }
            }

            if (build == "Upson I" || build == "Leonard Hall" || build == "CEC")
            {
                Floor.Items.Add("1");
                Floor.Items.Add("2");
            }
            else if (build == "Upson II" || build == "Harrington Hall")
            {
                Floor.Items.Add("1");
                Floor.Items.Add("2");
                Floor.Items.Add("3");
                Floor.Items.Add("4");
            }
            
        }

        private void Floor_SelectedIndexChanged(object sender, EventArgs e)
        {
            var fl = Floor.Items[Floor.SelectedIndex];
            //DisplayAlert(fl, "Selected Floor", "OK");
        }

        public async Task writeFile(string[] l)
        {
            //need to change database.txt to transcript.txt before handing in
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