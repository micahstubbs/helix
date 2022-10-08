import { CookieOptions, Response } from 'express';

import { TOKEN_RESPONSE_KEY } from '../../config';
import { HelixUserRequest } from '../d';
import getIdentityToken from './getIdentityToken';

// import tough, { MemoryCookieStore } from 'tough-cookie';
// const Cookie = tough.Cookie;
// const cookiejar = new tough.CookieJar(new MemoryCookieStore(), {
//   rejectPublicSuffixes: false,
// });

type Props = {
  credential: any;
  req: HelixUserRequest;
  res: Response;
};

export default async function sendCookie({ credential, req, res }: Props) {
  //
  // Identity Token cookie logic
  //
  let cookieName = 'Identity-Token';
  let cookieValue;
  let cookieExpiresOn: any;

  const expressCookieOptions: CookieOptions = {
    expires: cookieExpiresOn,
    secure: false,
    sameSite: 'none',
  };

  console.log('expressCookieOptions: ', expressCookieOptions);

  let currentDomain = req.get('host');
  console.log('currentDomain', currentDomain);
  if (currentDomain.startsWith('localhost')) {
    currentDomain = '.localhost';
  }
  const currentUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  console.log('currentUrl', currentUrl);

  // TODO narrow types here, remove as any
  const parsedBody = (await getIdentityToken(credential)) as any;

  // expressCookieOptions:  { expires: undefined, secure: false, sameSite: 'none' }
  //
  // currentDomain localhost:4200
  // currentUrl http://localhost:4200/api/user/login
  // (node:65024) UnhandledPromiseRejectionWarning: TypeError: Cannot read property 'value' of undefined
  //     at /helix-front/dist/server/controllers/user/sendCookie.js:40:34
  //     at Generator.next (<anonymous>)
  //     at fulfilled (/helix-front/dist/server/controllers/user/sendCookie.js:5:58)
  //     at processTicksAndRejections (internal/process/task_queues.js:95:5)
  // (Use `node --trace-warnings ...` to show where the warning was created)
  // (node:65024) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). To terminate the node process on unhandled promise rejection, use the CLI flag `--unhandled-rejections=strict` (see https://nodejs.org/api/cli.html#cli_unhandled_rejections_mode). (rejection id: 1)
  // (node:65024) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.
  cookieValue = parsedBody.value[TOKEN_RESPONSE_KEY];
  cookieExpiresOn = new Date(parsedBody.value.expiresOn);

  const toughCookieOptions: any = {
    key: cookieName,
    value: parsedBody.value[TOKEN_RESPONSE_KEY],
    expires: new Date(parsedBody.value.expiresOn),
    domain: currentDomain,
    secure: false,
    httpOnly: false,
    sameSite: 'None',
    hostOnly: false,
  };
  console.log('toughCookieOptions', toughCookieOptions);
  // const identityCookie = new Cookie(cookieOptions);

  // // asynchronously set the cookie
  // cookiejar.setCookie(
  //   identityCookie,
  //   currentUrl,
  //   function (err, cookie) {
  //     if (err)
  //       throw new Error(`Error setting cookie ${err}`);
  //     } else {
  //       console.log(`Successfully set identity token cookie`);
  //       console.log(cookie);
  //     }
  //   }
  // );

  // send cookie back to client
  res.cookie(cookieName, cookieValue, expressCookieOptions);
  // Update session cookie expiration to expire
  // at the same time as the identity token
  req.session.cookie.expires = expressCookieOptions.expires;
}
