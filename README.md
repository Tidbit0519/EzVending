# EZ VENDING
Ez Vending is a Node.js program that helps BYU users to locate the nearest vending machines to their curent building locations. The program can also recommend snacks based on their desired vending category and budget, and stores their favorite snacks along with purchase dates which they can retrieve to view or delete later.

# APIs
This program uses the following three APIs:
1. Person v3
2. LocationService v2
3. Vending v1

# User Guide
## Setting Up the Program
### 1. Clone repository
On your terminal, run these lines of code separately, and then install the npm packages
`git clone https://github.com/byu-oit/tan-technical-challenge`
`cd tan-techical-challenge`
`npm install`

### 2. Login to AWS (Optional: Turn on VPN)
This program requires connection to AWS Account `byu-org-trn` and OracleDB. Login to AWS and make sure you have acess to `byu-org-trn`.

After logging in, Click on PowerUser-797871726256 > Command line or programmatic access > PowerShell > Option 1: Set AWS environment variables
It will copy the environment variables, paste this onto the Terminal. Make sure you are in the right directory before doing so.

![alt text](https://github.com/byu-oit/tan-technical-challenge/blob/main/images/aws_environment_variables.png)


You might want to consider turning on GlobalProtect VPN if the program fails any point to connect to OracleDB.

### 3. Run the program
Type `node index` on your terminal to run the program.

## Navigating Around the Program
The program will first verify your connection to AWS and OracleDB. After that, you will be prompted to input an API token and BYU ID upon running the program. (The token in the image is just an example! Please use your own API token.)

![alt text](https://github.com/Tidbit0519/EzVending/blob/main/images/token_id_prompt.png)

Upon validation, the main menu will be displayed with a welcome message and the program brand logo.

![alt text](https://github.com/byu-oit/tan-technical-challenge/blob/main/images/main_menu.png)

You are presented with a few options to choose from.

### Locate the nearest vending machine
If you choose to locate the nearest vending machine, you will be redirected to pick the current or closest building to you. YOu can also search for the building name if the options are not presented in the list.

![alt text](https://github.com/Tidbit0519/EzVending/blob/main/images/location.png)

If there are vending machines around the area, the amount of the vending machines and their locations will be displayed.

![alt text](https://github.com/Tidbit0519/EzVending/blob/main/images/vending_info.png)

If there are none, you are presented with the option to go back to main menu or to exit the program.

### View my favorite snacks
You can view your saved favorite snacks here. A table will be printed on the terminal showing the information on the name of the snacks and purchase dates. You have the options to remove specific snacks or to clear out the list, or go back to the previous menu.

![alt text](https://github.com/Tidbit0519/EzVending/blob/main/images/favorite_snacks.png)

If you do not currently have any saved favorite snacks, you will be asked to be redirected to the main menu instead.

![alt text](https://github.com/Tidbit0519/EzVending/blob/main/images/favorite_snacks_empty.png)

In any case, if the table got removed from the database for any reason, it shall recreate a new table and prompt user to go back to the main menu for further actions.

![alt text](https://github.com/Tidbit0519/EzVending/blob/main/images/create_table.png)

* #### Remove snacks from list
You will be presented with options to remove. Simply navigate to one and press 'Enter'. Then, you be presented the option to go back to the main menu again.

![alt text](https://github.com/Tidbit0519/EzVending/blob/main/images/remove_snacks.png)

* #### Remove all
This option removes all snacks from the list.

* #### Back
Goes back to the main menu.

### Snacks recommendation
Upon choosing this option, you will be prompted to choose a category.

![alt text](https://github.com/Tidbit0519/EzVending/blob/main/images/category.png)

After choosing a category, you will be prompted to input a budget amount.

!![alt text](https://github.com/Tidbit0519/EzVending/blob/main/images/budget.png)

The program will then return a snack name and the cost of it. You will also be asked to save the recommended snack to your favorites or not.

![alt text](https://github.com/Tidbit0519/EzVending/blob/main/images/recommend.png)

### Exiting the program
Once you are done using the program, you can go back to main menu and exit.


