/**
 * @file Handles all database operations
 * @author Jason Ban Tze Tan
 * Last edited: August 18, 2022 - added jsdocs
 */

// variable setup to connect to OracleDB
const oracle = require('oracledb')
oracle.outFormat = oracle.OBJECT;
oracle.autoCommit = true;

// variable setup to connect to AWS
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2'});
const ssm = new AWS.SSM();

// OracleDB link
const params = {
    connectString: 'cman1-dev.byu.edu:31200/cescpy1.byu.edu'
}

// AWS Parameters
let parameters = {
    Names: ['/tan-technical-challenge/dev/DB-USERNAME', '/tan-technical-challenge/dev/PASSWORD'],
    WithDecryption: true
}

/**
 * Set oracle credentials so user can access DB
 * @param username AWS username
 * @param password AWS password
 * @returns void
 */
const setOracleCredentials = async (username, password) => {
    params.user = username
    params.password = password
}

/**
 * Check if user is connected to AWS
 * @returns void
 */
const getOracleCredentials = async function () {
    console.log('Testing AWS connection...')
    try {
        const firstParams = await ssm.getParameters(parameters).promise();
        await setOracleCredentials(firstParams.Parameters[0].Value, firstParams.Parameters[1].Value);
    } catch (e) {
        console.log('You are not connected to the AWS. Please make sure you have set the environmental variables correctly.');
        process.exit();
    }
}

/**
 * Tests connection to OracleDB
 * @returns {Promise<void>}
 */
async function testOracleConnectivity() {
    try {
        console.log('Testing connection to on-prem OracleDB');
        const conn = await oracle.getConnection(params);
        await conn.close();
        console.log('Successfully connected to on-prem OracleDB');
    } catch (e) {
        console.log('Unable to create a connection to on-prem OracleDB. Try connecting to Global VPN.');
        process.exit();
    }
}

/**
 * Generates today's date and converts the format into mm/dd/yyyy
 * @returns {Date}
 */
const getDate = () => {
    let today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = today.getFullYear();
    today = mm + '/' + dd + '/' + yyyy;
    return today
}

async function createTable() {
    const conn = await oracle.getConnection(params);
    await conn.execute('DECLARE\n' +
        'tbl_count number;\n' +
        'sql_stmt long;\n' +
        '\n' +
        'BEGIN\n' +
        '    SELECT COUNT(*) INTO tbl_count \n' +
        '    FROM dba_tables\n' +
        '    WHERE owner = \'HR\'\n' +
        '    AND table_name = \'T1\';\n' +
        '\n' +
        '    IF(tbl_count <= 0)\n' +
        '        THEN\n' +
        '        sql_stmt:=\'\n' +
        '        CREATE TABLE FAVORITE_SNACKS (\n' +
        '            BYU_ID VARCHAR(9),\n' +
        '            FULL_NAME VARCHAR(30),\n' +
        '            SNACKS VARCHAR(30),\n' +
        '            PRICE VARCHAR(5),\n' +
        '            PURCHASE_DATE VARCHAR(10)\n' +
        '        )\';\n' +
        '        EXECUTE IMMEDIATE sql_stmt;\n' +
        '    END IF;\n' +
        'END;');
    await conn.close();
}

/**
 * View all information results of user's favorite snacks based on BYU ID
 * @param byuId user input BYU ID
 * @returns false if table is empty
 * @returns a string if catches error
 */
async function viewAllTable(byuId) {
    try {
        console.log('Showing results...')
        const conn = await oracle.getConnection(params);
        const result = await conn.execute('SELECT SNACKS, PRICE, PURCHASE_DATE FROM OIT#JTBT2.FAVORITE_SNACKS WHERE ' + 'BYU_ID = :BYU_ID', [byuId]);
        await conn.close();
        if(result.rows.length != 0) {
            console.table(result.rows);
        } else {
            console.log('You do not have any favorite snacks!');
            return false;
        }
    } catch (e) {
        if(e){
            console.log('Table doesn\'t exist yet. Creating table...')
            await createTable();
        }
        console.log('Successfully created table! Please go back to the main menu and get a snack recommendation!');
        return false;
    }
}

/**
 * View all names of snacks in user's favorite snacks table
 * @param byuId user input BYU ID
 * @returns an array of snacks
 */
async function viewSnacksOnly(byuId) {
    let snacks
    try {
        const conn = await oracle.getConnection(params);
        const result = await conn.execute('SELECT SNACKS FROM OIT#JTBT2.FAVORITE_SNACKS WHERE ' + 'BYU_ID = :BYU_ID', [byuId]);
        await conn.close();
        snacks = result.rows.map(obj => obj.SNACKS);
    } catch (e) {
        throw 'You do not have any favorite snacks yet!';
    }
    return(snacks);
}

/**
 * Adds the snack of user's choice into the favorite_snacks table in OracleDB
 * @param byuId user input BYU ID
 * @param fullName user input name
 * @param snacks user selection of snack
 * @param price user input price
 * @param purchaseDate generated from getDate() function
 * @returns {Promise<void>}
 */
async function addToTable (byuId, fullName, snacks, price, purchaseDate) {
    try {
        const conn = await oracle.getConnection(params);
        await conn.execute('INSERT INTO OIT#JTBT2.FAVORITE_SNACKS (BYU_ID, FULL_NAME, SNACKS, PRICE, PURCHASE_DATE )' +
            'VALUES (:BYU_ID, :FULL_NAME, :SNACKS, :PRICE, :PURCHASE_DATE)',
            [byuId, fullName, snacks, price, purchaseDate]);
        await conn.close();
        console.log('Successfully added favorite snacks!');
    } catch (e) {
        console.error('Cannot perform this action at the moment. Check if you\'re connected to the VPN. Or, alternatively, please try again later.');
    }
}

/**
 * Removes all rows from user's favorite snacks table based on BYU ID
 * @param byuId user input BYU ID
 * @returns {Promise<void>}
 */
async function deleteAllFromTable (byuId) {
    try {
        console.log('Deleting history...')
        const conn = await oracle.getConnection(params);
        await conn.execute('DELETE FROM OIT#JTBT2.FAVORITE_SNACKS WHERE ' + 'BYU_ID = :BYU_ID', [byuId]);
        await conn.close();
        console.log('Successfully deleted all purchase history.');
    } catch (e) {
        console.error('Unable to delete item. Please try again later.');
        throw e;
    }
}

/**
 * Deletes user's selected snacks from favorite snacks table in OracleDB
 * @param byuId user input BYU ID
 * @param snacks user selection of snacks
 * @returns {Promise<void>}
 */
async function deleteRowFromTable (byuId, snacks) {
    try {
        console.log('Deleting snack from favorites...')
        const conn = await oracle.getConnection(params);
        const escape = snacks.replace('\'', '\'\'')
        await conn.execute('DELETE FROM OIT#JTBT2.FAVORITE_SNACKS WHERE ' + 'BYU_ID = :BYU_ID AND SNACKS = :SNACKS', [byuId, escape]);
        await conn.close();
        console.log('You have successfully removed the snack from your favorites.');
    } catch (e) {
        console.error('Unable to delete item. Please try again later.');
    }
}

module.exports = {getOracleCredentials, testOracleConnectivity, getDate, viewAllTable, viewSnacksOnly, addToTable, deleteAllFromTable, deleteRowFromTable}