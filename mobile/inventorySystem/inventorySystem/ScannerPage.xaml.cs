using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;
using ZXing;

//xmlns:zxing="clr-namespace:ZXing.Net.Mobile.Forms;assembly=ZXing.Net.Mobile.Forms"-->

namespace inventorySystem
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class ScannerPage : ContentPage
    {
        public ScannerPage()
        {
            InitializeComponent();
        }
        private async void logoutButton_OnClick(object sender, EventArgs e)
        {
            
            await Navigation.PushAsync(new LoginPage());
        }
        private async void acceptedButton_OnClick(object sender, EventArgs e)
        {
            string Barcode = barcode.Text;
            
            string[] properties = await readFile(Barcode);
            
            if (properties == null)
            {
                string[] BC = new string[11];
                BC[0] = Barcode;
                
                await Navigation.PushAsync(new EditPropertiesPage(BC));
            }
            else
            {
                await Navigation.PushAsync(new DisplayPropertiesPage(properties));
            }
        }

        /*public void Handle_OnScanResult(ZXing.Result result)
        {
                DisplayAlert("Scanned result", result.Text, "OK");
                //loop{
                    //if (result = barcodeinFile) {
                        //await Navigation.PushAsync(new DisplayPropertiesPage(array));
                    //}else{
                        //await Navigation.PushAsync(new EditPropertiesPage(result));
                    //}
                //
        }*/

        public async Task<string[]> readFile(string bc)
        {
            string fileName = Path.Combine(System.Environment.GetFolderPath(System.Environment.SpecialFolder.Personal), "database.txt");
            if(fileName == null || !File.Exists(fileName)){
                return null;
            }

            using (var reader = new StreamReader(fileName, true))
            {
                string line;
                while((line = await reader.ReadLineAsync()) != null){
                    var vals = line.Split(',')[0];
                    //await DisplayAlert("Scanned result", vals, "OK");
                    if (bc.Equals(vals) == true)
                    {
                        string[] list = line.Split(',');
                        return list;
                    }
                }
            }
            return null;
        }
    }
}