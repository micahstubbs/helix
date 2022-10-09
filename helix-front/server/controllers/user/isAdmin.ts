import { LDAP } from '../../config';

export default async function isAdmin(props: any) {
  console.log(`isAdmin was called`);
  const { credential, ldap } = props;

  // (&(objectClass=user)(sAMAccountName=yourUserName)
  //   (memberof=CN=YourGroup,OU=Users,DC=YourDomain,DC=com))

  const opts = {
    filter: `(&(sAMAccountName=${credential.username})(objectcategory=person))`,
    scope: 'sub',
  };

  console.log(`LDAP search opts: ${JSON.stringify(opts)}`);

  //
  // http://ldapjs.org/client.html
  //
  ldap.search(LDAP.base, opts, function (err, res) {
    let isInAdminGroup = false;
    if (err) {
      console.error('error from isAdmin', err);
    }

    res.on('searchRequest', (searchRequest) => {
      console.log('searchRequest: ', searchRequest.messageID);
    });

    res.on('searchEntry', function (entry) {
      console.log('entry: ' + JSON.stringify(entry.object));
      if (entry.object && !err) {
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
  });
}
