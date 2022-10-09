import * as LdapClient from 'ldapjs';
import { Response } from 'express';

import { LDAP, IDENTITY_TOKEN_SOURCE } from '../../config';
import { HelixUserRequest } from '../d';
import isAdmin from './isAdmin';
import sendCookie from './sendCookie';

export default async function login(req: HelixUserRequest, res: Response) {
  const credential = req.body;
  if (!credential.username || !credential.password) {
    res.status(401).json(false);
    return;
  }

  // check LDAP
  const ldap = LdapClient.createClient({ url: LDAP.uri });

  // TODO refactor to some function
  // TODO that returns a Promise
  // TODO that we can await
  // const bindName = `${credential.username}${LDAP.principalSuffix}`
  const bindName = `cn=${credential.username},${LDAP.base}`;
  ldap.bind(bindName, credential.password, async (err: any) => {
    if (err) {
      console.log('error from login', err);
      res.status(401).json(false);
    } else {
      //
      // LDAP login success
      //

      //
      // Check if the logged in user is in the admin group
      //
      const isInAdminGroup = (await isAdmin({
        credential,
        ldap,
      })) as unknown as boolean;

      if (IDENTITY_TOKEN_SOURCE) {
        //
        // Send the cookie with the identity token, if configured
        //
        sendCookie({
          credential,
          req,
          res,
        });
      }

      req.session.username = credential.username;
      req.session.isAdmin = isInAdminGroup;
      res.json(isInAdminGroup);
    }
  });
}
