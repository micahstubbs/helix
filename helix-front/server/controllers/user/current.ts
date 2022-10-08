import { Response } from 'express';

import { HelixUserRequest } from '../d';

export default function current(req: HelixUserRequest, res: Response) {
  res.json(req.session.username || 'Sign In');
}
