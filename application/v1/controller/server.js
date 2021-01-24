const express = require('express');
const bodyParser = require('body-parser');
const glob = require('glob');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const app = express();

app.use(
    bodyParser.urlencoded({
        extended: false,
    })
);
app.use(cors());
app.use(bodyParser.json());
const ROUTES_PATH = 'application/v1/controller/routes';
const routes = path.join(process.cwd(), ROUTES_PATH);
glob.sync(`${routes}/*.js`).forEach((file) => {
    require(path.resolve(file))(app);
});

app.listen(3000, () => {
    console.log('listening on port 3000');
});

module.exports = app;
