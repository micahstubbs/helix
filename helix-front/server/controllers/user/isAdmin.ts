import util from 'util';

import { LDAP } from '../../config';

export default async function isAdmin(props: any) {
  console.log(`isAdmin was called`);
  const { credential, ldap } = props;
  const ldapSearchPromise = util.promisify(ldap.search.bind(ldap));

  let isInAdminGroup = false;

  // (&(objectClass=user)(sAMAccountName=yourUserName)
  //   (memberof=CN=YourGroup,OU=Users,DC=YourDomain,DC=com))
  // `(&(objectClass=user)(sAMAccountName=${credential.username}))`,
  //
  const opts = {
    filter: `(&(sAMAccountName=${credential.username})(objectcategory=person))`,
    scope: 'sub',
  };

  console.log(`LDAP search opts: ${JSON.stringify(opts)}`);

  //
  // http://ldapjs.org/client.html
  //
  try {
    const res = await ldapSearchPromise(LDAP.base, opts);

    res.on('searchRequest', (searchRequest) => {
      console.log('searchRequest: ', searchRequest.messageID);
    });

    res.on('searchEntry', (entry) => {
      console.log('entry: ' + JSON.stringify(entry.object));
      if (entry.object) {
        const groups = entry.object['memberOf'];
        for (const group of groups) {
          console.log(`group: ${group}`);
          const groupName = group.split(',', 1)[0].split('=')[1];
          if (groupName == LDAP.adminGroup) {
            isInAdminGroup = true;
            break;
          }
        }
      }
      console.log(`isInAdminGroup: ${isInAdminGroup}`);
      return isInAdminGroup;
    });

    res.on('searchReference', (referral) => {
      console.log('referral: ' + referral.uris.join());
    });

    res.on('error', (err) => {
      console.error('error: ' + err.message);
    });

    res.on('end', (result) => {
      console.log('status: ' + result.status);
    });
  } catch (err) {
    console.log(`Error from ldap search: ${err}`);
    return isInAdminGroup;
  }
}
