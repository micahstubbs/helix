import { Response } from 'express';

import { HelixUserRequest } from '../d';

// Is the current user an admin?
// If so, then they `can` access the Helix UI
export default function can(req: HelixUserRequest, res: Response) {
  try {
    return res.json(req.session.isAdmin ? true : false);
  } catch (err) {
    return false;
  }
}
