const path = require('path');
const fs = require('fs');
const sorter = require('./common/sorter');
const { getConnection, query } = require('../../model/postgres');
require('dotenv').config()

const VERSIONS_DIRECTORY = 'sql';

function processSQLFile(fileName) {
    // Extract SQL queries from files. Assumes no ';' in the fileNames
    const queries = fs.readFileSync(fileName).toString()
      .replace(/(\r\n|\n|\r)/gm," ") // remove newlines
      .replace(/\s+/g, ' ') // excess white space
      .split(";") // split into all statements
      .map(Function.prototype.call, String.prototype.trim)
      .filter(function(el) {return el.length != 0}); // remove any empty ones

    return queries;
}

module.exports.applyVersion = async () => {
    // return new Promise((resolve) => {
        console.log('here')
        // resolve()
    // })
    const dir = path.join(process.cwd(), VERSIONS_DIRECTORY);
    const files = sorter.sortFiles(await fs.readdirSync(dir), '.sql');
    const db_connection = getConnection({
        username: process.env.POSTGRES_USERNAME,
        password: process.env.POSTGRES_PASSWORD,
        db: process.env.POSTGRES_DB,
        port: process.env.POSTGRES_PORT,
        host: process.env.POSTGRES_HOST
    })
    console.log('logging db_connection', db_connection)
    for(const file of files) {
        const queries = processSQLFile(`${dir}/${file}`);
        
        for(const _query of queries) {
            console.log(`EXECUTING QUERY: ${_query}`);
            await query(db_connection, _query);
            console.log('FINISHED QUERY')
        }
    }

    console.log("DB migrations successful");
}