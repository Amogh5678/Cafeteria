const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Cafeteria Seat Check-In API",
      version: "1.0.0",
      description: "API for checking in to reserved cafeteria seats"
    },
    servers: [
      {
        url: "http://localhost:3000"
      }
    ]
  },
  apis: ["./src/routes/*.js"]
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
