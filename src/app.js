const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./api/middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'CashUp' }));

app.use(errorHandler);

module.exports = app;
