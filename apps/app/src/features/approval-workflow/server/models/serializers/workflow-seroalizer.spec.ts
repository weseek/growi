import { mock } from 'vitest-mock-extended';

import { IWorkflowHasId } from '../../../interfaces/workflow';

import { serializeWorkflowSecurely } from './workflow-seroalizer';


describe('workflow-seroalizer', () => {

  describe('.serializeWorkflowSecurely', async() => {
    const mocks = vi.hoisted(() => {
      return {
        serializeUserSecurelyMock: vi.fn(() => { return {} }),
      };
    });

    vi.mock('~/server/models/serializers/user-serializer', () => {
      return { serializeUserSecurely: mocks.serializeUserSecurelyMock };
    });

    it('Should execute the dependent serializeUserSecurely when serializeWorkflowSecurely is called', () => {
      // setup
      const workflow = mock<IWorkflowHasId>({ approverGroups: [] });

      // when
      serializeWorkflowSecurely(workflow);

      // then
      expect(mocks.serializeUserSecurelyMock).toHaveBeenCalled();
    });
  });

});
