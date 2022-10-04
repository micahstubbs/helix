import { Request, Response, Router } from 'express';
import * as LdapClient from 'ldapjs';
import * as request from 'request';
import { cookie } from 'request';
import tough, { MemoryCookieStore } from 'tough-cookie';
const Cookie = tough.Cookie;
const cookiejar = new tough.CookieJar(new MemoryCookieStore(), {
  rejectPublicSuffixes: false,
});

import {
  LDAP,
  IDENTITY_TOKEN_SOURCE,
  TOKEN_RESPONSE_KEY,
  CUSTOM_IDENTITY_TOKEN_REQUEST_BODY,
} from '../config';
import { HelixUserRequest } from './d';

export class UserCtrl {
  constructor(router: Router) {
    router.route('/user/authorize').get(this.authorize);
    router.route('/user/login').post(this.login.bind(this));
    router.route('/user/current').get(this.current);
    router.route('/user/can').get(this.can);
  }

  protected authorize(req: HelixUserRequest, res: Response) {
    // you can rewrite this function to support your own authorization logic
    // by default, doing nothing but redirection
    if (req.query.url) {
      res.redirect(req.query.url as string);
    } else {
      res.redirect('/');
    }
  }

  protected current(req: HelixUserRequest, res: Response) {
    res.json(req.session.username || 'Sign In');
  }

  protected can(req: HelixUserRequest, res: Response) {
    try {
      return res.json(req.session.isAdmin ? true : false);
    } catch (err) {
      // console.log('error from can', err)
      return false;
    }
  }

  protected login(req: HelixUserRequest, res: Response) {
    const credential = req.body;
    if (!credential.username || !credential.password) {
      res.status(401).json(false);
      return;
    }

    // check LDAP
    const ldap = LdapClient.createClient({ url: LDAP.uri });
    ldap.bind(
      credential.username + LDAP.principalSuffix,
      credential.password,
      (err) => {
        if (err) {
          res.status(401).json(false);
        } else {
          // login success

          //
          // Get an Identity-Token
          // if an IDENTITY_TOKEN_SOURCE
          // is specified in the config
          //
          if (IDENTITY_TOKEN_SOURCE) {
            const body = JSON.stringify({
              username: credential.username,
              password: credential.password,
              ...CUSTOM_IDENTITY_TOKEN_REQUEST_BODY,
            });

            const options = {
              url: IDENTITY_TOKEN_SOURCE,
              json: '',
              body,
              headers: {
                'Content-Type': 'application/json',
              },
              agentOptions: {
                rejectUnauthorized: false,
              },
            };

            request.post(options, (error, _res, body) => {
              if (error) {
                throw new Error(
                  `Failed to get ${IDENTITY_TOKEN_SOURCE} Token: ${error}`
                );
              } else if (body?.error) {
                throw new Error(body?.error);
              } else {
                const parsedBody = JSON.parse(body);
                console.log(
                  'parsedBody from identity token source call',
                  parsedBody
                );

                let currentDomain = req.get('host');
                console.log('currentDomain', currentDomain);
                if (currentDomain.startsWith('localhost')) {
                  currentDomain = '.localhost';
                }
                const currentUrl = `${req.protocol}://${req.get('host')}${
                  req.originalUrl
                }`;
                console.log('currentUrl', currentUrl);

                const cookieOptions: any = {
                  key: 'Identity-Token',
                  value: parsedBody.value[TOKEN_RESPONSE_KEY],
                  expires: new Date(parsedBody.value.expiresOn),
                  domain: currentDomain,
                  secure: false,
                  httpOnly: false,
                  sameSite: 'None',
                  hostOnly: false,
                };
                console.log('cookieOptions', cookieOptions);
                const identityCookie = new Cookie(cookieOptions);

                // asynchronously set the cookie
                cookiejar.setCookie(
                  identityCookie,
                  currentUrl,
                  function (err, cookie) {
                    if (err) {
                      throw new Error(`Error setting cookie ${err}`);
                    } else {
                      console.log(`Successfully set identity token cookie`);
                      console.log(cookie);
                    }
                  }
                );

                // res.cookie(
                //   'Identity-Token',
                //   parsedBody.value[TOKEN_RESPONSE_KEY],
                //   cookieOptions
                // );

                // // TODO
                // // TODO remove testing code
                // // TODO
                // res.cookie(
                //   'TestCookieWithOptions',
                //   parsedBody.value[TOKEN_RESPONSE_KEY],
                //   cookieOptions
                // );

                // res.cookie(
                //   'TestCookieSession',
                //   parsedBody.value[TOKEN_RESPONSE_KEY]
                // );
                // // TODO
                // // TODO end testing code
                // // TODO

                console.log('cookieOptions: ', cookieOptions);

                // Update session cookie expiration to expire
                // at the same time as the identity token
                req.session.cookie.expires = cookieOptions.expires;
              }
            });
          }

          //
          // Check if the logged in user is in the admin group
          //
          const opts = {
            filter:
              '(&(sAMAccountName=' +
              credential.username +
              ')(objectcategory=person))',
            scope: 'sub',
          };

          ldap.search(LDAP.base, opts, function (err, result) {
            let isInAdminGroup = false;
            result.on('searchEntry', function (entry) {
              if (entry.object && !err) {
                const groups = entry.object['memberOf'];
                for (const group of groups) {
                  const groupName = group.split(',', 1)[0].split('=')[1];
                  if (groupName == LDAP.adminGroup) {
                    isInAdminGroup = true;
                    break;
                  }
                }
              }

              req.session.username = credential.username;
              req.session.isAdmin = isInAdminGroup;
              res.json(isInAdminGroup);
            });
          });
        }
      }
    );
  }
}
