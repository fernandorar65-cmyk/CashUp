const app = require('./app');
const config = require('./config');

const server = app.listen(config.port, () => {
  console.log(`CashUp corriendo en http://localhost:${config.port}`);
  console.log(`Swagger: http://localhost:${config.port}/api-docs`);
});

module.exports = server;
