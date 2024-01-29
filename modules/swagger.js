import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

const options = {
  swaggerDefinition: {
    info: {
      title: "Test API",
      version: "1.0.0",
      description: "Test API with express",
    },
    host: "localhost:3000",
    basePath: "/",
  },
  apis: ["./routes/*.js", "./swagger/*"],
};

const specs = swaggerJSDoc(options);

export { swaggerUi, specs };
