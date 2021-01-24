const {getConnection, query} = require('./postgres');

const _getConnection = () => {
    const dbConnection = getConnection({
        username: process.env.POSTGRES_USERNAME,
        password: process.env.POSTGRES_PASSWORD,
        db: process.env.POSTGRES_DB,
        port: process.env.POSTGRES_PORT,
        host: process.env.POSTGRES_HOST,
    });

    return dbConnection;
};

const getMostRecentByLengthRush = (rollLength) => {
    return `
        SELECT * FROM (
            SELECT
                component.line_item_length,
                component.id,
                orders.order_date,
                component.size,
                line_item.sku,
                line_item.rush,
                SUM(line_item_length) OVER (ORDER BY line_item.rush DESC NULLS LAST, line_item.id, orders.order_date) AS total_roll_length
            FROM line_item
            INNER JOIN "order" orders ON line_item.order_id = orders.id
            INNER JOIN component ON component.line_item_id = line_item.id
            WHERE orders.cancelled = false
        ) AS t
        WHERE t.total_roll_length <= ${rollLength}
        ORDER BY t.rush DESC NULLS LAST, t.order_date ASC
    `;
};

const getMostRecentByLengthNoRush = (rollLength) => {
    return `
        SELECT * FROM (
            SELECT
                component.line_item_length,
                component.id,
                orders.order_date,
                component.size,
                line_item.sku,
                line_item.rush,
                SUM(line_item_length) OVER (ORDER BY line_item.id, orders.order_date) AS total_roll_length
            FROM line_item
            INNER JOIN "order" orders ON line_item.order_id = orders.id
            INNER JOIN component ON component.line_item_id = line_item.id
            WHERE orders.cancelled = false
            AND line_item.rush = false
        ) AS t
        WHERE t.total_roll_length <= ${rollLength}
        ORDER BY t.order_date;
    `;
};

const getNextRunnerQueryBuilder = (after_order_date, offset) => {
    return `
        SELECT component.id, component.size, orders.order_date, line_item.sku, line_item.rush FROM component
        INNER JOIN line_item on line_item.id = component.line_item_id
        INNER JOIN "order" orders on orders.id = line_item.order_id
        where status = 'Pending'
        AND size = '2.5x7'
        AND orders.order_date > '${after_order_date}'
        LIMIT 1 OFFSET ${offset}
    `;
};

exports.getNextRunner = async (after_order_date, offset = 0) => {
    const connection = _getConnection();
    const queryString = getNextRunnerQueryBuilder(after_order_date, offset);
    return query(connection, queryString);
};

exports.getMostRecentOrdersByRollLength = async (rollLength, rush) => {
    const connection = _getConnection();
    const queryString = rush ? getMostRecentByLengthRush(rollLength) : getMostRecentByLengthNoRush(rollLength);
    return query(connection, queryString);
};
