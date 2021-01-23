const express = require('express'),
  fs = require('fs'),
  bodyParser = require('body-parser'),
  glob = require('glob'),
  path = require('path'),
  app = express(),
  cors = require('cors');

app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(cors());
app.use(bodyParser.json());
const ROUTES_PATH = 'application/v1/controller/routes';
const routes = path.join(process.cwd(), ROUTES_PATH);
glob.sync(`${routes}/*.js`).forEach(function(file) {
  require(path.resolve(file))(app);
})

app.listen(3000, () => {
    console.log('listening on port 3000');
});

module.exports = app;