import express, { Express } from 'express';
import http from 'http';

import config, { Config } from './config';
import { createApp, listenAndServe, attachSubscriptionHandlers } from './app';
import logger from './logger';
import { createMongoDB } from './services/mongodb';
import { createRedisClient } from './services/redis';
import getManagementSchema from 'talk-server/graph/management/schema';
import getTenantSchema from 'talk-server/graph/tenant/schema';
import { Schemas } from 'talk-server/graph/schemas';

export interface ServerOptions {
    config?: Config;
}

/**
 * Server provides an interface to create, start, and manage a Talk Server.
 */
class Server {
    // parentApp is the root application that the server will bind to.
    private parentApp: Express;

    // schemas are the set of GraphQLSchema objects for each schema used by the
    // server.
    private schemas: Schemas;

    // config exposes application specific configuration.
    public config: Config;

    // httpServer is the running instance of the HTTP server that will bind to
    // the requested port.
    public httpServer: http.Server;

    constructor(options: ServerOptions) {
        this.parentApp = express();
        this.config = config
            .load(options.config || {})
            .validate({ allowed: 'strict' });

        // Load the graph schemas.
        this.schemas = {
            management: getManagementSchema(),
            tenant: getTenantSchema(),
        };
    }

    /**
     * start orchestrates the application by starting it and returning a promise
     * when the server has started.
     *
     * @param parent the optional express application to bind the server to.
     */
    public async start(parent?: Express) {
        const port = this.config.get('port');

        // Ensure we have an app to bind to.
        parent = parent ? parent : this.parentApp;

        // Setup MongoDB.
        const mongo = await createMongoDB(config);

        // Setup Redis.
        const redis = await createRedisClient(config);

        // Create the Talk App, branching off from the parent app.
        const app: Express = await createApp({
            parent,
            mongo,
            redis,
            config: this.config,
            schemas: this.schemas,
        });

        // Start the application and store the resulting http.Server.
        this.httpServer = await listenAndServe(app, port);

        // Setup the websocket servers on the new http.Server.
        attachSubscriptionHandlers(this.schemas, this.httpServer);

        logger.info({ port }, 'now listening');
    }
}

export default Server;