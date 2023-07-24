const http = require('http');


const port = process.env.PORT || 3000;
const app = require('./app');

//Function inside that runs everytime an instance is created
const server = http.createServer(app);

server.listen(port);