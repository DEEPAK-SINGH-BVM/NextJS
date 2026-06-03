import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import{ userSchema,hotelBrandSchema,hotelBranchSchema} from "./schemas/index.js"

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Food billing API',
      version: '1.0.0',
    },
    components: {
      schemas: {
        User: userSchema,
        HotelBrand: hotelBrandSchema,
        Branch: hotelBranchSchema,
        // Table: tablesSchema,
      },
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{
      BearerAuth: [],
    }],
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
