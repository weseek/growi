const { getInstance } = require('../setup-crowi');

describe('Config model test', () => {
  // eslint-disable-next-line no-unused-vars
  let crowi;

  beforeAll(async(done) => {
    crowi = await getInstance();
    done();
  });

  describe('.CONSTANTS', () => {
    test('AclService has constants', async() => {
      expect(crowi.aclService.labels.SECURITY_REGISTRATION_MODE_OPEN).toBe('Open');
      expect(crowi.aclService.labels.SECURITY_REGISTRATION_MODE_RESTRICTED).toBe('Restricted');
      expect(crowi.aclService.labels.SECURITY_REGISTRATION_MODE_CLOSED).toBe('Closed');
    });
  });

});
