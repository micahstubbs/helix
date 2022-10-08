import * as express from 'express';
import { Express } from 'express-serve-static-core';

import UserController from './controllers/user';
import { HelixController } from './controllers/helix';

export default function setRoutes(app: Express) {
  const router = express.Router();

  // Instantiate routes
  UserController(router);
  new HelixController(router);

  // Apply the routes to our application with the prefix /api
  app.use('/api', router);

  /* GET /admin to check app health. */
  app.get('/admin', (_req, res, _next) => {
    res.status(200).send('GOOD');
  });
}
