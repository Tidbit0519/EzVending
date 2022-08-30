/**
 * EZ VENDING
 * A program that locates the nearest vending machines based on user's current building location. Stores user's favorite
  snacks, and recommends snacks
 * @file Controls the flow of the program
 * @author Jason Ban Tze Tan
 * Last edited: August 18, 2022 - added jsdocs
 */

/**
 * imports node packages inquirer & enquirer to prompt for user inputs.
 * imports api.js and database.js
 */
const api = require('./api');
const db = require("./database");
const inquirer = require("inquirer");
const { Select, AutoComplete } = require('enquirer');

/**
 * @global token - stores user input token
 * @global byuId - stores user input BYU ID
 * @global person - sotres user's full name
 */
let token, byuId, person;

/**
 * Call other functions to store user's token, BYU ID, and name into global variables.
 * @returns a string if person name is undefined
 */
async function getInfo() {
    token = await api.getApiToken();
    byuId = await api.getByuId();
    person = await api.getPerson(token, byuId);
    if(person ==='undefined') {
        return 'Please input a valid BYU ID.';
    }
}

/**
 * A welcome message with user's name. Prints the program brand logo.
 * @returns {Promise<void>}
 */
async function welcome() {
    console.clear();
    console.log('Hello, ' + person + '. Welcome to');
    console.log('\x1b[36m%s\x1b[0m','                                              ■');
    console.log('\x1b[36m%s\x1b[0m','■■■■■■           ■■     ■                     ■  ■');
    console.log('\x1b[36m%s\x1b[0m','■                 ■    ■■                     ■');
    console.log('\x1b[36m%s\x1b[0m','■       ■■■■■     ■    ■   ■■■■  ■ ■■■    ■■■■■  ■   ■ ■■■    ■■■■');
    console.log('\x1b[36m%s\x1b[0m','■          ■      ■■   ■  ■■  ■  ■■  ■■  ■■  ■■  ■   ■■  ■■  ■■  ■');
    console.log('\x1b[36m%s\x1b[0m','■■■■■■    ■        ■  ■■  ■   ■■ ■    ■  ■    ■  ■   ■    ■  ■   ■');
    console.log('\x1b[36m%s\x1b[0m','■        ■■        ■  ■   ■■■■■■ ■    ■  ■    ■  ■   ■    ■  ■■  ■');
    console.log('\x1b[36m%s\x1b[0m','■        ■         ■■ ■   ■      ■    ■  ■    ■  ■   ■    ■   ■■■');
    console.log('\x1b[36m%s\x1b[0m','■       ■           ■■    ■■     ■    ■  ■■  ■■  ■   ■    ■  ■■');
    console.log('\x1b[36m%s\x1b[0m','■■■■■■ ■■■■■■       ■■     ■■■■  ■    ■   ■■■ ■  ■   ■    ■   ■■■■');
    console.log('\x1b[36m%s\x1b[0m','                                                             ■   ■■');
    console.log('\x1b[36m%s\x1b[0m','                                                             ■■■■■');
};

/**
 * Displays main menu and navigates based on user's selections
 * @returns {Promise<void>}
 */
async function menu() {
    console.log('EzVending is designed for your convenience by locating the nearest vending machine to you!' +
        'You can also get a snack recommendation and save it into your favorites too.');
    const options = new Select({
        name: 'menu',
        message: 'What will you like to do today?',
        choices: ['Locate the nearest vending machine.', 'View my favorite snacks', 'Snacks recommendations', 'Exit']
    });
    await options.run()
        .then(async answer => {
            if(answer === 'Locate the nearest vending machine.') {
                console.clear();
                await locate();
            } else if(answer === 'View my favorite snacks') {
                console.clear();
                const table = await db.viewAllTable(byuId);
                if(table === false) {
                    return backToMainMenu();
                } else {
                    console.log(table);
                }
                const options = new Select({
                    name: 'delete',
                    message: 'What will you like to do?',
                    choices: ['Remove snacks from list','Remove all','Back']
                });
                await options.run()
                    .then(async answer => {
                        if (answer === 'Remove snacks from list') {
                            await removeSnacks();
                        } else if (answer === 'Remove all') {
                            await db.deleteAllFromTable(byuId);
                        } else {
                        }
                        return backToMainMenu();
                    }).catch(error => {
                        console.log(error);
                    });
            } else if(answer === 'Snacks recommendations') {
                console.clear();
                await recommend();
            } else {
                loop = false;
                console.clear();
                console.log('Have a great day!')
            }
        })
}

/**
 * Function to be called if user chooses 'Locate the nearest vending machine'
 * Prompts user to pick the nearest building location
 * Shows vending machine count and their locations
 * @property vendingExist - stores boolean value to check if vending machine exists
 * @returns a boolean value depending if vending machine exists
 * @returns backToMainMenu() function
 */
async function locate() {
    console.clear();
    let vendingExist = true;
    const locate = await new AutoComplete ({
        name: 'location',
        message: 'Where are you at? (Please search for the closest building to you.)',
        limit: 10,
        choices: await api.getBuildingLocations(token)
    });
    await locate.run()
        .then(async answer => {
            const checkVending = await api.getUserLocation(token, answer);
            const vendingCount = await api.getVendingCount(token, checkVending);
            const vendingLocation = await api.getVendingLocation(token, checkVending);
            if(vendingCount > 0) {
                console.log('There are ' + vendingCount + ' vending machines near you.')
                console.log('They are located at the following locations.')
                if(vendingLocation.length > 1) {
                    for(let i=0; i<vendingLocation.length; i++) {
                        console.log(vendingLocation);
                    }
                } else {
                    console.log(vendingLocation);
                }
                return backToMainMenu();
            } else {
                console.log('Sorry, there are ' + vendingCount + ' vending machines near you. Please try somewhere else.')
                vendingExist = false;
                return backToMainMenu();
            }
        })
    return vendingExist;
}

/**
 * Function to be called in recommend()
 * Prompt for user input budget
 * @returns user input budget
 */
async function getBudget() {
    const response = await inquirer
        .prompt([
            {
                message: 'How much are you willing to spend? $',
                name: 'key',
                type: 'input'
            }
        ])
    return response.key*100;
}

/**
 * Function to be called in recommend()
 * Prompts for user's selection of vending product category
 * @property catId - category ID of vending product
 * @returns catId
 */
async function userRecommendSelection() {
    console.clear();
    const options = new Select({
        name: 'menu',
        message: 'What do you feel like having today?',
        choices: ['Food/Snacks', 'Drinks', 'Candy', 'Ice Cream/Novelties']
    });
    let catId
    await options.run()
        .then(answer => {
            if (answer === 'Food/Snacks') {
                catId = '1000';
            } else if (answer === 'Drinks') {
                catId = '1001';
            } else if (answer === 'Candy') {
                catId = '1002';
            } else {
                catId = '1003';
            }
        })
    return catId;
}

/**
 * Function to be called if user selects 'Snacks recommendation' in menu()
 * Recommends a random snack to user and prompts user to save recommendation
 * @returns {Promise<void>}
 */
async function recommend() {
    console.clear();
    const catId = await userRecommendSelection();
    const budget = await getBudget();
    const snacks = await api.getVendingItem(token, catId, budget)
    const snackName = snacks[0];
    const snackPrice = snacks[1];
    console.log('Let\'s try ' + snackName + '! It costs $' + snackPrice);
    const prompt = await new Select({
        name: 'choice',
        message: 'Do you want to save this recommendation into your favorite snacks?',
        choices: ['Yes', 'No']
    });
    prompt.run()
        .then(async answer => {
            if(answer === 'Yes') {
                const date = db.getDate();
                await db.addToTable(byuId, person, snacks[0], snacks[1], date);
                console.log('You have successfully saved it into your favorite snack list.');
                return backToMainMenu();
            } else {
                console.log('Okay no biggie!')
                return backToMainMenu();
            }
        })
}

/**
 * Function to be called if user selects 'Removes snacks from list' in menu()
 * Display user's favorite snacks list and prompts user to select
 * @returns {Promise<void>}
 */
async function removeSnacks() {
    const deletion = await new AutoComplete ({
        name: 'snacks delete',
        message: 'Pick the snack you want to remove your favorite snack list.',
        limit: 10,
        choices: await db.viewSnacksOnly(byuId)
    });
    await deletion.run()
        .then(async answer => {
        await db.deleteRowFromTable(byuId, answer);
    })
}

/**
 * Function to be called and awaits user's selection to return to menu() or exit the program
 * @returns {Promise<void>}
 */
async function backToMainMenu() {
    const prompt = await new Select({
        name: 'choice',
        message: 'Do you want to go back to main menu?',
        choices: ['Yes', 'No, I will like to exit the program']
    });
    prompt.run()
        .then(async answer => {
            if(answer === 'Yes') {
                console.clear();
                await welcome();
                await menu();
            } else {
                process.exit('Thank you!');
            }
        })
}

/**
 * Controls the flow of the program
 * @returns {Promise<void>}
 */
async function exec() {
    console.log('Loading...')
    await db.getOracleCredentials();
    await db.testOracleConnectivity();
    await getInfo();
    await welcome();
    await menu();
}

exec();