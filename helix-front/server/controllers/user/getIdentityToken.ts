import * as request from 'request';

import {
  IDENTITY_TOKEN_SOURCE,
  CUSTOM_IDENTITY_TOKEN_REQUEST_BODY,
} from '../../config';

export default async function getIdentityToken(credential: any) {
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

    function callback(error, _res, body) {
      if (error) {
        throw new Error(
          `Failed to get ${IDENTITY_TOKEN_SOURCE} Token: ${error}`
        );
      } else if (body?.error) {
        throw new Error(body?.error);
      } else {
        const parsedBody = JSON.parse(body);
        console.log('parsedBody from identity token source call', parsedBody);
        return parsedBody;
      }
    }
    request.post(options, callback);
  }
}
