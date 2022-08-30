/**
 * @file This handle all the API calls
 * @author Jason Ban Tze Tan
 * Last edited: August 18, 2022 - added jsdocs
 */

const axios = require('axios');
const inquirer = require('inquirer');
const _ = require('lodash');

/**
 * Prompts user to input API token. Checks input length and assigns it to the global variable "token" in index.js
 * @returns API token
 */
async function getApiToken() {
    let max_api_token_length = 25;
    const response = await inquirer
        .prompt([
            {
                message: 'Please enter your API Token.',
                name: 'key',
                type: 'input',
                validate: async (input) => {
                    if (!(input.length > max_api_token_length)) {
                        return 'Please put in the correct access token.'
                    }
                    return true
                }
            }
        ])
    return response.key;
}

/**
 * Prompts user to input BYU ID. Checks input length and assigns it to the global variable "byuId" in index.js
 * @returns BYU ID
 */
async function getByuId() {
    let max_byu_id_length = 9;
    const response = await inquirer
        .prompt([
            {
                message: 'Please enter your BYU ID: ',
                name: 'byuId',
                type: 'input',
                validate: async (input) => {
                    if(input.length !== max_byu_id_length) {
                        return 'ID not found. Please try again.'
                    }
                    return true;
                }
            }
        ])
    return response.byuId;
}

/**
 * Calls Persons v3 API to retrieve the full name of the student
 * @param token user input of token
 * @param byuId user input of BYU ID
 * @property {String} name stores the name of the student
 * @returns the full name of the student associated with the BYU ID
 */
async function getPerson(token, byuId) {
    const options = {
        url: `https://api.byu.edu:443/byuapi/persons/v3/${byuId}`,
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    }

    let name;
    await axios(options)
        .then((body) => {
            const person = body.data.basic;
            name = person.name_fnf.value;
        }).catch(error => {
            return 'Please input a valid BYU ID';
        });
    return name;
}

/**
 * Calls LocationService v2 API and retrieves all building names
 * @param token user input of token
 * @property buildingName an array that stores all building names
 * @returns an array of all building names
 */
async function getBuildingLocations(token) {
    const options = {
        url: 'https://api.byu.edu:443/domains/mobile/location/v2/buildings',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    }
    let buildingNames = [];
    await axios(options)
        .then((body) => {
            const data = body.data;
            buildingNames = data.map(obj => obj.name);
        }).catch(error => {
            console.log(error);
        })
    return buildingNames;
}

/**
 * Calls LocationService v2 API and retrieves all buildings' latitude and longitude.
 * @param token user input of token
 * @param buildingName user selection of building name
 * @property coordinate stores building's latitude and longitude
 * @returns latitude and longitude of the building user picked
 */
async function getUserLocation(token, buildingName) {
    const options = {
        url: 'https://api.byu.edu:443/domains/mobile/location/v2/buildings',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    }
    let coordinate
    await axios(options)
        .then((body) => {
            const building = body.data;
            const result = building.find(obj => {
                return obj.name === buildingName
            });
            coordinate = [parseFloat(result.latitude).toFixed(3),
                parseFloat(result.longitude).toFixed(3)];
        }).catch(error => {
            console.log(error);
        })
    return await coordinate;
}

/**
 * Calls Vending API and compare its coordinate with the building of user's choice
 * @param token user input token
 * @param buildingLoc user selection of building's coordinate
 * @property count stores the count of vending machine that has similar coordinate as buildingLoc
 * @returns the amount of vending machine at the location
 */
async function getVendingCount(token, buildingLoc) {
    const options = {
        url: 'https://api.byu.edu:443/domains/vending/v1/vending.ashx?format=json&service=machines&action=listAllMachines',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    }
    let count;
    await axios(options)
        .then((body) => {
            const vending = body.data;
            const result = vending.filter(obj =>
                parseFloat(obj.lat).toFixed(3) === buildingLoc[0] &&
                parseFloat(obj.lng).toFixed(3) === buildingLoc[1]);
            count = result.length;
        }).catch(error => {
            console.log(error);
        })
    return count;
}

/**
 * Calls Vending API and compare its coordinate with the building of user's choice
 * @param token user input token
 * @param buildingLoc user selection of building's coordinate
 * @property vendingLoc stores the description of vending location
 * @returns the description of vending location
 */
async function getVendingLocation(token, buildingLoc) {
    const options = {
        url: 'https://api.byu.edu:443/domains/vending/v1/vending.ashx?format=json&service=machines&action=listAllMachines',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    }
    let vendingLoc;
    await axios(options)
        .then((body) => {
            const vending = body.data;
            const result = vending.filter(obj =>
                parseFloat(obj.lat).toFixed(3) === buildingLoc[0] &&
                parseFloat(obj.lng).toFixed(3) === buildingLoc[1]);
            vendingLoc = result.map(obj => obj.description)
        }).catch(error => {
            console.log(error);
        })
    return vendingLoc;
}

/**
 * Calls Vending API and return a random result from all vending products based on user's input
 * @param token user input token
 * @param catId user selection of product category
 * @param budget user input budget
 * @returns the name and price of vending item
 */
async function getVendingItem(token, catId, budget) {
    const options = {
        url: `https://api.byu.edu:443/domains/vending/v1/vending.ashx?format=json&service=merchandise&action=getProducts&cat=${catId}`,
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    }
    let name,price
    await axios(options)
        .then((body) => {
            const itemList = body.data;
            const result = itemList.filter(obj => obj.price < budget);
            const randomItem = result[Math.floor(Math.random() * result.length)];
            name = randomItem.description;
            price = (randomItem.price/100).toFixed(2);
        }).catch(error => {
        console.log(error);
    })
    return [name,price];
}

module.exports = {getApiToken, getByuId, getPerson, getUserLocation, getBuildingLocations, getVendingCount, getVendingLocation, getVendingItem}