import { Response } from 'express';

import { HelixUserRequest } from '../d';

export default function authorize(req: HelixUserRequest, res: Response) {
  // You can rewrite this function to support your own authorization logic
  // by default, doing nothing but redirection
  if (req.query.url) {
    res.redirect(req.query.url as string);
  } else {
    res.redirect('/');
  }
}
