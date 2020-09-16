using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xamarin.Forms;

namespace inventorySystem
{
    // Learn more about making custom code visible in the Xamarin.Forms previewer
    // by visiting https://aka.ms/xamarinforms-previewer
    [DesignTimeVisible(false)]
    public partial class LoginPage : ContentPage
    {
        public LoginPage()
        {
            InitializeComponent();
        }
        private async void navigateButton_OnClick(object sender, EventArgs e)
        {
            var passwordValue = password.Text;
            var usernameValue = username.Text;
            if (passwordValue == "password" && usernameValue == "admin")
            {
                await Navigation.PushAsync(new ScannerPage());
            }
            else
            {
                await DisplayAlert("Alert", "Incorrect Username and Password", "OK");

            }
        }
    }
}
