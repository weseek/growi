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
      conditionId | departments   | positions     | ruleStr                                                         | expected
      ${1}        | ${[]}         | ${['Leader']} | ${'Position'}                                                   | ${true}
      ${2}        | ${[]}         | ${['Leader']} | ${'Position: Leader'}                                           | ${true}
      ${3}        | ${['A']}      | ${[]}         | ${'Department: A || Department: B && Position: Leader'}         | ${true}
      ${4}        | ${['B']}      | ${['Leader']} | ${'Department: A || Department: B && Position: Leader'}         | ${true}
      ${5}        | ${['A', 'C']} | ${['Leader']} | ${'Department: A || Department: B && Position: Leader'}         | ${true}
      ${6}        | ${['B', 'C']} | ${['Leader']} | ${'Department: A || Department: B && Position: Leader'}         | ${true}
      ${7}        | ${[]}         | ${[]}         | ${'Department: A || Department: B && Position: Leader'}         | ${false}
      ${8}        | ${['C']}      | ${['Leader']} | ${'Department: A || Department: B && Position: Leader'}         | ${false}
      ${9}        | ${['A']}      | ${['Leader']} | ${'(Department: A || Department: B) && Position: Leader'}       | ${true}
      ${10}       | ${['B']}      | ${['Leader']} | ${'(Department: A || Department: B) && Position: Leader'}       | ${true}
      ${11}       | ${['C']}      | ${['Leader']} | ${'(Department: A || Department: B) && Position: Leader'}       | ${false}
      ${12}       | ${['A', 'B']} | ${[]}         | ${'(Department: A || Department: B) && Position: Leader'}       | ${false}
      ${13}       | ${['A']}      | ${[]}         | ${'Department: A NOT Position: Leader'}                         | ${true}
      ${14}       | ${['A']}      | ${['Leader']} | ${'Department: A NOT Position: Leader'}                         | ${false}
      ${15}       | ${[]}         | ${['Leader']} | ${'Department: A OR (Position NOT Position: User)'}             | ${true}
      ${16}       | ${[]}         | ${['User']}   | ${'Department: A OR (Position NOT Position: User)'}             | ${false}
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
