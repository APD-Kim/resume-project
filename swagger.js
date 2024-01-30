import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Express API with Swagger",
    version: "1.0.0",
  },
};

// Swagger 옵션 설정
const options = {
  swaggerDefinition,
  // API 파일 경로
  apis: ["./src/routers/*.js"], // 예: './routes/*.js'
};

const specs = swaggerJSDoc(options);

export { swaggerUi, specs };
