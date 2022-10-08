import { Router } from 'express';
import list from './list';
import proxy from './proxy';

export default function HelixController(router: Router) {
  router.route('/helix/list').get(list);
  router.route('/helix/*').all(proxy);
}
