const http = require('http');
const bodyparser = require('body-parser');
const express = require('express');
const app = express();
const fs = require('fs')
const config = require('./config');
let logger = require('./app/lib/loggerLib');
let mongoose = require('mongoose')

// global middleware
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

app.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', config.allowedCorsOrigin);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    next()
})
// end of global middleware

// bootstrap models

let modelPath = './app/model';
fs.readdirSync(modelPath).forEach((file) => {
    if (file.indexOf('.js')) {
        require(`${modelPath}/${file}`)
    }
})
// end of bootstrap models

// bootstrap routes
let routesPath = './app/routes';
fs.readdirSync(routesPath).forEach((file) => {
    if (file.indexOf('.js')) {
        let routes = require(`${routesPath}/${file}`);
        routes.setRoutes(app);
    }
})
// end of bootstrapping routes

let server = http.createServer(app)
server.listen(config.port);

server.on('listening', onListening)
server.on('error', onError)

/** 
 * Http events,
 * 
*/

// server listening event
function onListening() {
    logger.info(`server listening at port : ${config.port}`, 'index : onListening', 0);
    mongoose.connect(config.db.uri, { useUnifiedTopology: true, useNewUrlParser: true })
}

// server error event
function onError(error) {
    if (error.syscall !== 'listen') {
        logger.error(error.code + ' not equal listen', 'serverOnErrorHandler', 10)
        throw error;
    }


    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            logger.error(error.code + ':elavated privileges required', 'serverOnErrorHandler', 10);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            logger.error(error.code + ':port is already in use.', 'serverOnErrorHandler', 10);
            process.exit(1);
            break;
        default:
            logger.error(error.code + ':some unknown error occured', 'serverOnErrorHandler', 10);
            throw error;
    }
}

/**End of Http events */

/**
 * database connection settings
 */
mongoose.connection.on('error', function (err) {
    logger.error(err,
        'mongoose connection on error handler', 10)
}); // end mongoose connection error

mongoose.connection.on('open', function (err) {
    if (err) {
        logger.error(err, 'mongoose connection open handler', 10)
    } else {
        logger.info("database connection open",
            'database connection open handler', 10)
    }
}); // enr mongoose connection open handler