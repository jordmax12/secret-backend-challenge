const path = require('path');
const fs = require('fs');
const sorter = require('./common/sorter');
const {getConnection, query} = require('../../model/postgres');
require('dotenv').config();

const VERSIONS_DIRECTORY = 'migrations';
const STAR_COUNT = 80;

function processSQLFile(fileName) {
    // Extract SQL queries from files. Assumes no ';' in the fileNames
    let queries = fs
        .readFileSync(fileName)
        .toString()

    let DELIM = ';'
    // we will treat this migration as if its setting up stored procedures.
    // in a production setting, it might be good to try to not limit the user
    // to a migration file only being stored procedures or any other queries, but for
    // now this will have to do for the sake of time.
    if(queries.indexOf('CREATE OR REPLACE PROCEDURE') > -1) {
        DELIM = '$BODY$;'
    } 

    queries = queries
        .replace(/(\r\n|\n|\r)/gm, ' ') // remove newlines
        .replace(/\s+/g, ' ') // excess white space
        .split(DELIM)
        .map(Function.prototype.call, String.prototype.trim)
        .filter((el) => {
            return el.length !== 0;
        }) // remove any empty ones
        .map(query => query + DELIM) // add back $BODY$ or ;
    return queries;
}

const _get_stars = () => {
    return '*'.repeat(STAR_COUNT);
};

module.exports.applyVersion = async () => {
    const dir = path.join(process.cwd(), VERSIONS_DIRECTORY);
    const files = sorter.sortFiles(await fs.readdirSync(dir), '.sql');
    const dbConnection = getConnection({
        username: process.env.POSTGRES_USERNAME,
        password: process.env.POSTGRES_PASSWORD,
        db: process.env.POSTGRES_DB,
        port: process.env.POSTGRES_PORT,
        host: process.env.POSTGRES_HOST,
    });

    let total_query_count = 0;
    
    for (const [index, file] of files.entries()) {
        const queries = processSQLFile(`${dir}/${file}`);
        console.log('\n', _get_stars(), `\n\n\tStarting Queries on migration ${index + 1}...\n\n`, _get_stars());
        for (const _query of queries) {
            console.log(`\nEXECUTING QUERY: ${_query}`);
            await query(dbConnection, _query);
            total_query_count++;
            console.log('FINISHED QUERY\n');
        }
    }

    console.log(
        '\n',
        _get_stars(),
        `\n\n\tDB migrations successful, total migrations: ${files.length}, total operations: ${total_query_count}\n\n`,
        _get_stars()
    );
};
