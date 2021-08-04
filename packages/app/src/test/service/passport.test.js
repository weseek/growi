const { getInstance } = require('../setup-crowi');

describe('PassportService test', () => {
  let crowi;

  beforeEach(async() => {
    crowi = await getInstance();
  });


  describe('verifySAMLResponseByABLCRule()', () => {

    let getConfigSpy;
    let extractAttributesFromSAMLResponseSpy;

    beforeEach(async() => {
      // prepare spy for ConfigManager.getConfig
      getConfigSpy = jest.spyOn(crowi.configManager, 'getConfig');
      // prepare spy for extractAttributesFromSAMLResponse method
      extractAttributesFromSAMLResponseSpy = jest.spyOn(crowi.passportService, 'extractAttributesFromSAMLResponse');
    });

    /* eslint-disable indent */
    let i = 0;
    describe.each`
      conditionId | departments   | positions     | ruleStr                                                         | expected
      ${i++}      | ${undefined}  | ${undefined}  | ${'Department: A'}                                              | ${false}
      ${i++}      | ${[]}         | ${['Leader']} | ${'Position'}                                                   | ${true}
      ${i++}      | ${[]}         | ${['Leader']} | ${'Position: Leader'}                                           | ${true}
      ${i++}      | ${['A']}      | ${[]}         | ${'Department: A || Department: B && Position: Leader'}         | ${true}
      ${i++}      | ${['B']}      | ${['Leader']} | ${'Department: A || Department: B && Position: Leader'}         | ${true}
      ${i++}      | ${['A', 'C']} | ${['Leader']} | ${'Department: A || Department: B && Position: Leader'}         | ${true}
      ${i++}      | ${['B', 'C']} | ${['Leader']} | ${'Department: A || Department: B && Position: Leader'}         | ${true}
      ${i++}      | ${[]}         | ${[]}         | ${'Department: A || Department: B && Position: Leader'}         | ${false}
      ${i++}      | ${['C']}      | ${['Leader']} | ${'Department: A || Department: B && Position: Leader'}         | ${false}
      ${i++}      | ${['A']}      | ${['Leader']} | ${'(Department: A || Department: B) && Position: Leader'}       | ${true}
      ${i++}      | ${['B']}      | ${['Leader']} | ${'(Department: A || Department: B) && Position: Leader'}       | ${true}
      ${i++}      | ${['C']}      | ${['Leader']} | ${'(Department: A || Department: B) && Position: Leader'}       | ${false}
      ${i++}      | ${['A', 'B']} | ${[]}         | ${'(Department: A || Department: B) && Position: Leader'}       | ${false}
      ${i++}      | ${['A']}      | ${[]}         | ${'Department: A NOT Position: Leader'}                         | ${true}
      ${i++}      | ${['A']}      | ${['Leader']} | ${'Department: A NOT Position: Leader'}                         | ${false}
      ${i++}      | ${[]}         | ${['Leader']} | ${'Department: A OR (Position NOT Position: User)'}             | ${true}
      ${i++}      | ${[]}         | ${['User']}   | ${'Department: A OR (Position NOT Position: User)'}             | ${false}
    `('to be $expected under rule="$ruleStr"', ({
      conditionId, departments, positions, ruleStr, expected,
    }) => {
      test(`when conditionId=${conditionId}`, async() => {
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
