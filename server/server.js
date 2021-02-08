/**
 * @file server.js
 * @author Miroslav Georgiev
 * @version 0.0.5
 */
'use strict';

// load the packages
require('dotenv-safe').config();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const certPath = `server/certs`;

// Set up WebSocket Server
/**
 * START WebSocket Server
 */
const WebSocketServer = require('uWebSockets.js');
const wssOptions = {
    cert_file_name: `${certPath}/miro.pem`,
    key_file_name: `${certPath}/miro.key`,
    passphrase: config.certphrase,
};
const wss = WebSocketServer.SSLApp(wssOptions);

require('./routes/v1/stream')(wss);

wss.listen(Number.parseInt(config.wsport, 10), (started) => {
    if (started) {
        console.info(`${new Date()}: The web socket server has been started on port: ${config.wsport}`);
    } else {
        console.error(`${new Date()}: The web socket server failed to start!`);
    }
});
/**
 * END WebSocket Server
 */

// Setup web server to serve the static files (ExpressJS)
/**
 * START Web Server
 */
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const compress = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const spdy = require('spdy');
const helpers = require('./helpers');

const apiRoutesV1 = require('./routes/v1/api')(app, express);
const options = {
    cert: fs.readFileSync(`${certPath}/miro.pem`),
    key: fs.readFileSync(`${certPath}/miro.key`),
    passphrase: config.certphrase,
    minVersion: crypto.DEFAULT_MIN_VERSION,
    maxVersion: crypto.DEFAULT_MAX_VERSION,
};

const RateLimit = require('express-rate-limit');
const limiter = new RateLimit({
    windowMs: config.windowMs * 60 * 1000, // minutes windows to track requests (default 25)
    max: config.maxRequests, // limit each IP to maximum requests per windowMs (default 150)
    delayMs: 0 // disable delaying - full speed until the max limit is reached
});

// print if debugging logs are enabled
if (config.debug) {
    console.info(`##############################`);
    console.info(`###     DEBUG ENABLED     ####`);
    console.info(`##############################`);

    // log all requests to the console
    app.use(morgan('dev'));
}

// enable when you're behind a reverse proxy (Heroku, Bluemix, AWS if you use an ELB, custom Nginx setup, etc)
if (config.trustProxy) {
    app.enable('trust proxy');

    if (config.debug) {
        console.info(`${new Date()}: 'trust proxy' enabled!`);
    }
}

// protect the app from some well-known web vulnerabilities by setting HTTP headers appropriately
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                connectSrc: ["wss:"],
            },
        },
    })
);

// compress static files (JavaScript, CSS, images)
// MUST BE PLACED BEFORE DEFINING THE STATIC FILES FOLDER/PATH!!!
app.use(compress());

// apply rate limiter to all requests
app.use(limiter);

// use body parser to get info from POST requests
// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// for parsing application/json
app.use(bodyParser.json());

// handle CORS requests
app.use(helpers.handleCORS);

// set the public folder to serve public assets the frontend will request
app.use(express.static('public'));

// all the routes will be prefixed with /api
app.use('/api/v1', apiRoutesV1);

// middleware to handle server side errors
app.use(helpers.handleErrors);

// catch all routes and send the user to the frontend
// has to be registered after API ROUTES
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/../public/index.html'));
});

const server = spdy.createServer(options, app);
// start the server
server.listen(config.port, () => {
    console.info(`${new Date()}: The server has been started on port: ${config.port}`);
    console.info(`${new Date()}: The environment is: ${config.env}`);
});

/**
 * END Web Server
 */
