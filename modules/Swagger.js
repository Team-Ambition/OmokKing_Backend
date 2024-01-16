const swaggerUi = require('swagger-ui-express');
const swaggereJsdoc = require('swagger-jsdoc');

const options = {
  swaggerDefinition: {
    info: {
      title: 'Omoking API',
      version: '1.0.0',
      description: 'Omoking API with express',
    },
    host: 'http://122.34.57.9:OOOO',
    basePath: '/'
  },
  apis: ['./routes/*.js', './Swagger/*']
};

const specs = swaggereJsdoc(options);

module.exports = {
  swaggerUi,
  specs
};