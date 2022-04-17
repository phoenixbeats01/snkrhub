import { Request, Response } from 'express';
const { ApolloServer, GraphQLRequest } = require('apollo-server');
const { ApolloGateway, externalSupergraphUpdateCallback, RemoteGraphQLDataSource} = require('@apollo/gateway');
const { watch, readFileSync } = require('fs');

// Types
import { ApolloRequest, ApolloContext, ApolloBuildService } from './types'

// Initialize an ApolloGateway instance and pass it the supergraph schema
let supergraphUpdate;
const gateway = new ApolloGateway({
  async supergraphSdl({ update, healthCheck }: typeof externalSupergraphUpdateCallback) {
    // create a file watcher
    const watcher = watch('../supergraph.graphql');

    // subscribe to file changes
    watcher.on('change', async () => {
      // update the supergraph schema
      try {
        console.log(`📦 [gateway]: Rebuilding supergraph `);
        const updatedSupergraph = readFileSync("../supergraph.graphql", 'utf16le')
    
        // optional health check update to ensure our services are responsive
        await healthCheck(updatedSupergraph);
        
        // update the supergraph schema
        update(updatedSupergraph);
      } catch (e) {
        // handle errors that occur during health check or while updating the supergraph schema 
        console.error(e);   
      }
    });

    // Fetch inital schema
    supergraphUpdate = update;
    return {
      supergraphSdl: await readFileSync('../supergraph.graphql', 'utf16le'),

      // cleanup is called when the gateway is stopped
      async cleanup() {
        watcher.close();
      }
    }
  },
  buildService({ name, url }: ApolloBuildService) {
    return new RemoteGraphQLDataSource({
      url,
      willSendRequest({ request, context }: ApolloContext) {
        // pass the user's id from the context to underlying services
        // as a header called `user-id`
        request.http.headers.set('authorization', context.userId);
      },
    });
  },
});

// Pass the ApolloGateway to the ApolloServer constructor
const server = new ApolloServer({
  gateway,
  context: ({ req }: ApolloRequest) => {
    const token = req.headers.authorization || '';
    const userId = 'shit'

    // Add the user ID to the context
    return { userId };
  },
});

const PORT = process.env.PORT || 3000;
server.listen({ port: PORT }).then(() => {
    console.log(`⚡️ [gateway]: Gateway is online at http://localhost:${PORT}/graphql`);
  });