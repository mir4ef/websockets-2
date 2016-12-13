/**
 * @file scripts.js
 * @author Miroslav Georgiev
 * @version 0.0.1
 */

(function () {
    'use strict';

    const txtInput = document.querySelector(`#txtInput`);
    const btnSendMsg = document.querySelector(`#btnSendMsg`);
    const socketURL = `wss://localhost:8443/api/v1/stream`;
    let socket;
    let connectionInterval;

    // attach click event handler to the button
    btnSendMsg.addEventListener('click', sendMsg.bind(null, txtInput), false);

    // open a socket connection to the server
    // set a default url if one is not passed
    function openConnection(url = socketURL) {
        // make sure WebSocket is support in the browser
        if (window.WebSocket) {
            // make sure a connection is not open already
            if (socket !== undefined && socket.readyState !== socket.CLOSED) {
                console.log(`Socket connection is already open.`);

                // clear a reconnection interval if one triggered the connection
                clearInterval(connectionInterval);
                connectionInterval = null;

                return;
            }

            // try to open the connection
            socket = new WebSocket(url);
            socket.onopen = onOpen;
            socket.onerror = onError;
            socket.onclose = onClose;
            socket.onmessage = onMessage;
        } else {
            console.error(`Your browser does not support WebSocket.`);
        }
    }

    // open connection handler
    function onOpen(event) {
        console.log(`onOpen:`, event);

        // clear a reconnection interval if one triggered the connection
        clearInterval(connectionInterval);
        connectionInterval = null;
    }

    // connection error handler
    function onError(event) {
        console.error(`Error communicating with the server:`, event);
    }

    // close connection handler
    function onClose(event) {
        console.log(`Disconnected from the server! Code: '${event.code}' and reason: '${event.reason}'.`);
        console.log(`Trying to reconnect...`);

        // make sure an interval is not already triggered
        if (!connectionInterval) {
            connectionInterval = setInterval(openConnection, 5000, socketURL);
        }
    }

    // message from the server handler
    function onMessage(event) {
        console.log(`onMessage:`, event.data);
    }

    // send a message to the server handler
    function sendMsg(msg) {
        socket.send(msg.value);
    }

    // start the connection on page load
    openConnection(socketURL);
})();