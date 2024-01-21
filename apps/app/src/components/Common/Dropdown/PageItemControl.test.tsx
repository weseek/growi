import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { PointerEventsCheckLevel } from '@testing-library/user-event';

import { PageItemControl } from './PageItemControl';


describe('PageItemControl.tsx', () => {
  // TODO: https://redmine.weseek.co.jp/issues/138836 remove skip() after resolution
  it.skip('Should trigger onClickRenameMenuItem() when clicking the rename button with pageInfo.isDeletable being "false"', async() => {
    // setup
    const onClickRenameMenuItemMock = vi.fn();

    const pageInfo = {
      isV5Compatible: true,
      isEmpty: false,
      isDeletable: false,
      isAbleToDeleteCompletely: true,
      isRevertible: true,
    };

    const props = {
      pageId: 'dummy-page-id',
      isEnableActions: true,
      pageInfo,
      onClickRenameMenuItem: onClickRenameMenuItemMock,
    };

    render(<PageItemControl {...props} />);

    // when
    const openPageMoveRenameModalButton = screen.getByTestId('open-page-move-rename-modal-btn');
    await waitFor(() => userEvent.click(openPageMoveRenameModalButton, { pointerEventsCheck: PointerEventsCheckLevel.Never }));

    // then
    expect(onClickRenameMenuItemMock).toHaveBeenCalled();
  });
});
