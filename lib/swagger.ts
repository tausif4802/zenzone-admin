import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = () => {
  const spec = createSwaggerSpec({
    apiFolder: 'app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'ZenZone Admin API Documentation',
        version: '1.0.0',
        description: 'API documentation for the ZenZone Admin Dashboard',
      },
      servers: [
        {
          url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
          description: 'API Server',
        },
      ],
      tags: [
        { name: 'Auth', description: 'Authentication endpoints' },
        { name: 'Blogs', description: 'Blog management endpoints' },
        {
          name: 'Breathing Guides',
          description: 'Breathing guide management endpoints',
        },
        { name: 'Users', description: 'User management endpoints' },
        { name: 'Upload', description: 'File upload endpoints' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });
  return spec;
};
