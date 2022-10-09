export const HELIX_ENDPOINTS = {
  helix: [
    {
      default: 'http://localhost:8100/admin/v2',
    },
  ],
};

export const SESSION_STORE = undefined;

export const SSL = {
  port: 0,
  keyfile: '',
  certfile: '',
  passfile: '',
  cafiles: [],
};

export const LDAP = {
  uri: 'ldap://example.com',
  base: 'DC=example,DC=com',
  principalSuffix: '@example.com',
  adminGroup: 'admin',
};

export const IDENTITY_TOKEN_SOURCE = undefined; // 'www.example.com';
export const CUSTOM_IDENTITY_TOKEN_REQUEST_BODY = {};
export const TOKEN_RESPONSE_KEY = 'token';
