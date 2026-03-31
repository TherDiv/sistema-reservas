const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Configuración básica de OpenAPI
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Sistema de Reservas',
            version: '1.0.0',
            description: 'Documentación interactiva de la API para gestión de reuniones y horarios.',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor Local'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        }
    },
    // Le decimos a Swagger que busque comentarios en todos los archivos de rutas
    apis: ['./src/routes/*.js'], 
};

const swaggerSpec = swaggerJSDoc(options);

const swaggerDocs = (app, port) => {
    // Ruta donde vivirá la página web de la documentación
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log(`📚 Documentación disponible en http://localhost:${port}/api-docs`);
};

module.exports = swaggerDocs;