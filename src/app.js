const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./api/middleware/errorHandler');
const authRoutes = require('./api/routes/auth');
const clientsRoutes = require('./api/routes/clients');
const creditsRoutes = require('./api/routes/credits');
const paymentsRoutes = require('./api/routes/payments');
const collectionsRoutes = require('./api/routes/collections');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'CashUp' }));

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/credits', creditsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/collections', collectionsRoutes);

app.use(errorHandler);

module.exports = app;
