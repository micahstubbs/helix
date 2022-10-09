import { LDAP } from '../../config';

export default async function isAdmin(props: any) {
  const { credential, ldap } = props;

  // (&(objectClass=user)(sAMAccountName=yourUserName)
  //   (memberof=CN=YourGroup,OU=Users,DC=YourDomain,DC=com))

  const opts = {
    filter: `(&(sAMAccountName=${credential.username})(objectcategory=person))`,
    scope: 'sub',
  };

  ldap.search(LDAP.base, opts, function (err, result) {
    let isInAdminGroup = false;
    if (err) {
      console.log('error from isAdmin', err);
    }
    result.on('searchEntry', function (entry) {
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
  });
}
