import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import { PageItemControl } from './PageItemControl';


describe('PageItemControl.tsx', () => {
  // TODO: https://redmine.weseek.co.jp/issues/138836 remove skip() after resolution
  it.skip('Should fire onClickRenameMenuItem() when clicking the rename button, with pageInfo.isDeletable being "false"', async() => {
    // setup
    const onClickRenameMenuItemMock = vi.fn(() => {});

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
    const renameButton = screen.getByText('Move/Rename');
    fireEvent.click(renameButton);

    // then
    expect(onClickRenameMenuItemMock).toHaveBeenCalled();
  });
});
