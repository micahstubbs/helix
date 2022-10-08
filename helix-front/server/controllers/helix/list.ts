import { Request, Response } from 'express';

import { HELIX_ENDPOINTS } from '../../config';

export default function list(_req: Request, res: Response) {
  try {
    res.json(HELIX_ENDPOINTS);
  } catch (err) {
    console.log('error from helix/list/');
    console.log(err);
  }
}
