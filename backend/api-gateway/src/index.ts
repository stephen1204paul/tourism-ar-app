import 'reflect-metadata';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import cors from 'cors';
import dotenv from 'dotenv';
import { POIResolver } from './resolvers/POIResolver';
import { UserResolver } from './resolvers/UserResolver';
import { ARContentResolver } from './resolvers/ARContentResolver';

dotenv.config();

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Build GraphQL schema
  const schema = await buildSchema({
    resolvers: [POIResolver, UserResolver, ARContentResolver],
    validate: false,
  });

  // Create Apollo Server
  const apolloServer = new ApolloServer({
    schema,
    context: ({ req }) => {
      const token = req.headers.authorization || '';
      return { token };
    },
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: '/graphql' });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  app.listen(PORT, () => {
    console.log(`🚀 API Gateway running at http://localhost:${PORT}`);
    console.log(`📊 GraphQL endpoint: http://localhost:${PORT}${apolloServer.graphqlPath}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
