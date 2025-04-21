import type { IPageInfoForOperation } from '@growi/core/dist/interfaces';
import {
  fireEvent, screen, within,
} from '@testing-library/dom';
import { render } from '@testing-library/react';
import { mock } from 'vitest-mock-extended';

import { PageItemControl } from './PageItemControl';


// mock for isIPageInfoForOperation

const mocks = vi.hoisted(() => ({
  isIPageInfoForOperationMock: vi.fn(),
}));

vi.mock('@growi/core/dist/interfaces', () => ({
  isIPageInfoForOperation: mocks.isIPageInfoForOperationMock,
}));


describe('PageItemControl.tsx', () => {
  describe('Should trigger onClickRenameMenuItem() when clicking the rename button', () => {
    it('without fetching PageInfo by useSWRxPageInfo', async() => {
      // setup
      const pageInfo = mock<IPageInfoForOperation>();

      const onClickRenameMenuItemMock = vi.fn();
      // return true when the argument is pageInfo in order to supress fetching
      mocks.isIPageInfoForOperationMock.mockImplementation((arg) => {
        if (arg === pageInfo) {
          return true;
        }
      });

      const props = {
        pageId: 'dummy-page-id',
        isEnableActions: true,
        pageInfo,
        onClickRenameMenuItem: onClickRenameMenuItemMock,
      };

      render(<PageItemControl {...props} />);

      // when
      const button = within(screen.getByTestId('open-page-item-control-btn')).getByText(/more_vert/);
      fireEvent.click(button);
      const renameMenuItem = await screen.findByTestId('rename-page-btn');
      fireEvent.click(renameMenuItem);

      // then
      expect(onClickRenameMenuItemMock).toHaveBeenCalled();
    });
  });
});
