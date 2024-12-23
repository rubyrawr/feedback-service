export const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Сервис обратной связи API',
        version: '1.0.0',
        description: 'API документация для сервиса обратной связи'
      },
      servers: [
        {
          url: `http://localhost:${process.env.PORT || 5000}`,
          description: 'Сервер разработки',
        },
      ],
      components: {
        schemas: {
          Feedback: {
            type: 'object',
            properties: {
              id: { 
                type: 'integer',
                description: 'Уникальный идентификатор фидбека'
              },
              title: { 
                type: 'string',
                description: 'Заголовок фидбека'
              },
              content: { 
                type: 'string',
                description: 'Содержание фидбека'
              },
              category: { 
                type: 'integer',
                description: 'ID категории'
              },
              status: { 
                type: 'integer',
                description: 'Статус фидбека'
              },
              author_id: { 
                type: 'integer',
                description: 'ID автора'
              },
              created_at: { 
                type: 'string', 
                format: 'date-time',
                description: 'Дата создания'
              },
              updated_at: { 
                type: 'string', 
                format: 'date-time',
                description: 'Дата обновления'
              }
            }
          },
          Vote: {
            type: 'object',
            required: ['user_id', 'feedback_id'],
            properties: {
              id: { 
                type: 'integer',
                description: 'Уникальный идентификатор голоса'
              },
              user_id: { 
                type: 'integer',
                description: 'ID пользователя, который проголосовал'
              },
              feedback_id: { 
                type: 'integer',
                description: 'ID фидбека, за который проголосовали'
              }
            }
          }
        }
      }
    },
    apis: ['./src/routes/*.ts']
  };