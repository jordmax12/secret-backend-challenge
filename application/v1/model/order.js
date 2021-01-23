const { Client } = require('pg')
const { getConnection } = require('./postgres');

exports.get_by_id = () => {
    const connection = getConnection({
        db: process.env.POSTGRES_DB,
        username: process.env.POSTGRES_USERNAME,
        password: process.env.POSTGRES_PASSWORD,
        port: process.env.POSTGRES_PORT
    })

    console.log('logging connection', connection);
    return true;
}