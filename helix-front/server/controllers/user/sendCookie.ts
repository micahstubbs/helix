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
