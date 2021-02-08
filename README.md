# Secure WebSockets with NodeJS

NodeJS (+ ExpressJS) secure WebSockets (`wss`) and http/2 (`h2`, which is `https` by default) example. This example uses `µWS` on the sever
side and native JavaScript implementation on the client side.

1. Run `npm ci` to install all packages.
1. Generate certificates and place them in the `certs` folder (`./server/certs`) for local development. If you don't know how to generate
   `.pem` and `.key` files, you can search the internet or run this in your terminal `openssl req -x509 -newkey rsa:4096 -keyout miro.key
   -out miro.pem -days 365`. If you set up a password for your certs, you will need to provide it when you start the server with the
   environment variable `CERTPHRASE`. (Note: Make sure the name of the certs you create matches the names inside `server/server.js`. If
   necessary, please update either the cert names or `server.js` so both match.)
1. Create an `.env` file to match the `.env.example` one and populate it to match your settings and preferences.
1. If you want to enable `debug` mode to see more verbose output in the console, please set `APP_DEBUG="true"` when you start the server
1. Start the servers with `node server/server.js`. If you use the default port configuration, the url will be `https://localhost:8443` for
   the web server and `wss://localhost:9000` for the WebSocket server. If you are using a different port(s) (by setting the environment
   variable(s) `PORT` and/or `WS_PORT`), update the URL(s) accordingly.

The WebSocket server expects connections on `/api/v1/stream` (`wss://localhost:9000/api/v1/stream`).
