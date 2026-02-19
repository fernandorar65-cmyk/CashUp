const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDoc = require('./swagger');
const authRoutes = require('./routes/auth');
const loanRoutes = require('./routes/loans');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'CashUp' }));

app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);

app.use(errorHandler);

module.exports = app;
