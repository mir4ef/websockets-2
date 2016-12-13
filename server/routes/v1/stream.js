/**
 * @file stream.js contains Streaming/Websocket API routes used by the application
 * @author Miroslav Georgiev
 * @version 0.0.1
 */

'use strict';

const config = require('../../config');

module.exports = wss => {

    /**
     * *************************************************
     * START EVENT DEFINITIONS
     * *************************************************
     */

    wss.on('connection', ws => {
        ws.on('message', gotMsg);
    });

    wss.on('error', socketError);

    /**
     * *************************************************
     * END EVENT DEFINITIONS
     * *************************************************
     */

    /**
     * *************************************************
     * START EVENT HANDLERS/METHODS
     * *************************************************
     */

    function gotMsg(msg) {
        console.log(`received message: '${msg}'.`);

        // send a response to the client
        this.send(`received your message: ${msg}`);
    }

    function socketError(error) {
        console.error(`${new Date()}: Could not start server and error:`, error);
    }

    /**
     * *************************************************
     * END EVENT HANDLERS/METHODS
     * *************************************************
     */
};