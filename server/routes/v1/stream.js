/**
 * @file stream.js contains Streaming/Websocket API routes used by the application
 * @author Miroslav Georgiev
 * @version 0.0.2
 */

'use strict';

const { SHARED_COMPRESSOR } = require('uWebSockets.js');

module.exports = wss => {

    /**
     * *************************************************
     * START EVENT DEFINITIONS
     * *************************************************
     */

    wss.ws('/api/v1/stream', {
        compression: SHARED_COMPRESSOR,
        open: connectionOpened,
        close: connectionClosed,
        upgrade: connectionUpgrade,
        message: gotMsg,
    });

    // handle any other requests
    wss.any('/*', (res, req) => {
        res.writeStatus('401');
        res.end();
    });

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

    function connectionOpened(ws) {
        console.log('A WebSocket connected with URL: ' + ws.url);
    }

    function connectionClosed(ws, code, message) {
        console.log('WebSocket closed:', code, Buffer.from(message).toString());
    }

    function connectionUpgrade(res, req, context) {
        console.log('An Http connection wants to become WebSocket, URL: ' + req.getUrl() + '!');

        /* This immediately calls open handler, you must not use res after this call */
        res.upgrade(
            {
                url: req.getUrl()
            },
            req.getHeader('sec-websocket-key'),
            req.getHeader('sec-websocket-protocol'),
            req.getHeader('sec-websocket-extensions'),
            context
        );

    }

    function gotMsg(ws, msg, isBinary) {
        console.log('==== received message:', Buffer.from(msg).toString());
        console.log('==== isBinary:', isBinary);

        // send a response to the client
        ws.send(`received your message - ${Buffer.from(msg).toString()}`);
    }

    /**
     * *************************************************
     * END EVENT HANDLERS/METHODS
     * *************************************************
     */
};
