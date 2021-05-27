const winston = require("winston");
require("winston-mongodb");

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.File({ filename: "myfile-log.log" }),
        new winston.transports.MongoDB({ db: "mongodb://localhost/Practics", options: { useNewUrlParser: true, useUnifiedTopology: true } })
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: 'exceptions.log' }),
        new winston.transports.MongoDB({ db: "mongodb://localhost/Practics", options: { useNewUrlParser: true, useUnifiedTopology: true } })
    ]
});


if ( process.env.NODE_ENV !== "production" ) {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

module.exports = function (err, req, res, next) {
    logger.log('error', err);

    // error
    // warn
    // info
    // verbose
    // debug
    // silly
    (err.message === undefined ) ? res.status(500).send(err) : res.status(500).send(err.message);
}