import { Router } from 'express';

import authorize from './authorize';
import can from './can';
import current from './current';
import login from './login';

export default function UserCtrl(router: Router) {
  router.route('/user/authorize').get(authorize);
  router.route('/user/login').post(login);
  router.route('/user/current').get(current);
  router.route('/user/can').get(can);
}
