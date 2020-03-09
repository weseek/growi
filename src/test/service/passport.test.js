const { getInstance } = require('../setup-crowi');

describe('PassportService test', () => {
  let crowi;

  beforeEach(async(done) => {
    crowi = await getInstance();
    done();
  });


  describe('verifySAMLResponseByABLCRule()', () => {

    let getConfigSpy;
    let extractAttributesFromSAMLResponseSpy;

    beforeEach(async(done) => {
      // prepare spy for ConfigManager.getConfig
      getConfigSpy = jest.spyOn(crowi.configManager, 'getConfig');
      // prepare spy for extractAttributesFromSAMLResponse method
      extractAttributesFromSAMLResponseSpy = jest.spyOn(crowi.passportService, 'extractAttributesFromSAMLResponse');
      done();
    });

    /* eslint-disable indent */
    describe.each`
      conditionId | departments   | positions     | ruleStr                                                                       | expected
      ${1}        | ${['A']}      | ${[]}         | ${'Department = A | Department = B & Position = Leader'}                      | ${true}
      ${2}        | ${['B']}      | ${['Leader']} | ${'Department = A | Department = B & Position = Leader'}                      | ${true}
      ${3}        | ${['A', 'C']} | ${['Leader']} | ${'Department = A | Department = B & Position = Leader'}                      | ${true}
      ${4}        | ${['B', 'C']} | ${['Leader']} | ${'Department = A | Department = B & Position = Leader'}                      | ${true}
      ${5}        | ${[]}         | ${[]}         | ${'Department = A | Department = B & Position = Leader'}                      | ${false}
      ${6}        | ${['C']}      | ${['Leader']} | ${'Department = A | Department = B & Position = Leader'}                      | ${false}
      ${7}        | ${['A']}      | ${['Leader']} | ${'Department = A & Position = Leader | Department = B & Position = Leader'}  | ${true}
      ${8}        | ${['B']}      | ${['Leader']} | ${'Department = A & Position = Leader | Department = B & Position = Leader'}  | ${true}
      ${9}        | ${['C']}      | ${['Leader']} | ${'Department = A & Position = Leader | Department = B & Position = Leader'}  | ${false}
      ${9}        | ${['A', 'B']} | ${['']}       | ${'Department = A & Position = Leader | Department = B & Position = Leader'}  | ${false}
    `('to be $expected under rule="$ruleStr"', ({
      conditionId, departments, positions, ruleStr, expected,
    }) => {
      test(`when condition=${conditionId}`, async() => {
        const responseMock = {};

        // setup mock implementation
        getConfigSpy.mockImplementation((ns, key) => {
          if (ns === 'crowi' && key === 'security:passport-saml:ABLCRule') {
            return ruleStr;
          }
          throw new Error('Unexpected behavior.');
        });
        extractAttributesFromSAMLResponseSpy.mockImplementation((response) => {
          if (response !== responseMock) {
            throw new Error('Unexpected args.');
          }
          return {
            Department: departments,
            Position: positions,
          };
        });

        const result = crowi.passportService.verifySAMLResponseByABLCRule(responseMock);

        expect(result).toBe(expected);
      });
    });

  });


});
