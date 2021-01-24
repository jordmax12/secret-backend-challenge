const {Client} = require('pg');

const requiredConfig = ['username', 'password', 'db', 'host', 'port'];

const validateConfig = (config) => {
    const missing = [];
    requiredConfig.forEach((req) => {
        if (!Object.prototype.hasOwnProperty.call(config, req)) missing.push(req);
    });

    return missing;
};

exports.getConnection = (config) => {
    const valid = validateConfig(config);
    if (valid.length === 0) {
        return `postgresql://${config.username}:${config.password}@${config.host}:${config.port || 5432}/${config.db}`;
    }
    throw new Error(`Missing required properties: ${valid.toString()}`);
};

exports.queryBuilder = () => {
    
}

exports.query = (connection, query) =>
    new Promise((resolve) => {
        const client = new Client(connection);

        client.connect();
        client.query(query, (err, res) => {
            if (err) {
                console.error(query, err);
                return;
            }

            client.end();
            resolve(res.rows);
        });
    });
