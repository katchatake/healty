require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const router = require('./api/v1/router');

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Healty API' });
});

app.use('/api/v1', router);

const Boom = require('@hapi/boom');

// Error Handling (Global with Boom Support)
app.use((err, req, res, next) => {
    // If it's not a Boom error, wrap it as an internal server error (500)
    const boomError = err.isBoom ? err : Boom.boomify(err, { statusCode: err.status || 500 });
    
    const { output } = boomError;
    const response = {
        success: false,
        status: output.statusCode,
        ...output.payload
    };

    // Include validation details if they exist (custom data in Boom)
    if (boomError.data) {
        response.errors = boomError.data;
    }

    // Log the error using our existing logger
    const logger = require('./utils/logger');
    logger.error(`${output.statusCode} - ${output.payload.message} - ${req.originalUrl} - ${req.method} - ${req.ip} - ${err.stack}`);

    res.status(output.statusCode).json(response);
});

module.exports = app;
