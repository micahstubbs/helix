import * as express from 'express';
import { Express } from 'express-serve-static-core';

import userController from './controllers/user';
import helixController from './controllers/helix';

export default function setRoutes(app: Express) {
  console.log(`setRoutes was called`);

  const router = express.Router();

  // Instantiate routes
  userController(router);
  helixController(router);

  // Apply the routes to our application with the prefix /api
  app.use('/api', router);

  /* GET /admin to enable checking app health. */
  app.get('/admin', (_req, res, _next) => {
    res.status(200).send('GOOD');
  });
}
