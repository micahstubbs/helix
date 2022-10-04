import { Request, Response, Router } from 'express';

import * as request from 'request';

import { HELIX_ENDPOINTS, IDENTITY_TOKEN_SOURCE } from '../config';
import { HelixUserRequest } from './d';

export class HelixCtrl {
  static readonly ROUTE_PREFIX = '/api/helix';

  constructor(router: Router) {
    router.route('/helix/list').get(this.list);
    router.route('/helix/*').all(this.proxy);
  }

  protected proxy(req: HelixUserRequest, res: Response) {
    const url = req.originalUrl.replace(HelixCtrl.ROUTE_PREFIX, '');
    const helixKey = url.split('/')[1];

    const segments = helixKey.split('.');
    const group = segments[0];

    segments.shift();
    const name = segments.join('.');

    const user = req.session.username;
    const method = req.method.toLowerCase();
    if (method != 'get' && !req.session.isAdmin) {
      res.status(403).send('Forbidden');
      return;
    }

    let apiPrefix = null;
    if (HELIX_ENDPOINTS[group]) {
      HELIX_ENDPOINTS[group].forEach((section) => {
        if (section[name]) {
          apiPrefix = section[name];
        }
      });
    }

    if (apiPrefix) {
      const realUrl = apiPrefix + url.replace(`/${helixKey}`, '');
      console.log(`helix-rest request url ${realUrl}`);

      const options = {
        url: realUrl,
        json: req.body,
        headers: {
          'Helix-User': user,
        },
      };

      //
      // If an auth token source is specified in the config
      // use the LDAP username and password to obtain a token
      // store that token in a cookie
      // then read that token from a cookie
      // then pass that token to the server
      // in the `Identity-Token` header
      //
      // if (IDENTITY_TOKEN_SOURCE) {
      //   // pass that token to the server
      //   // in the `Identity-Token` header
      //   options.headers['Identity-Token'] = req.cookies['Identity-Token'];
      // }

      request[method](options, (error, response, body) => {
        if (error) {
          res.status(response?.statusCode || 500).send(error);
        } else if (body?.error) {
          res.status(response?.statusCode || 500).send(body?.error);
        } else {
          res.status(response?.statusCode).send(body);
        }
      });
    } else {
      res.status(404).send('Not found');
    }
  }

  protected list(req: Request, res: Response) {
    try {
      res.json(HELIX_ENDPOINTS);
    } catch (err) {
      console.log('error from helix/list/');
      console.log(err);
    }
  }
}
