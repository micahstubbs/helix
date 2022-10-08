import { LDAP } from '../../config';

export default async function isAdmin(props: any) {
  const { credential, ldap } = props;

  const opts = {
    filter:
      '(&(sAMAccountName=' + credential.username + ')(objectcategory=person))',
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
      return isInAdminGroup;
    });
  });
}
