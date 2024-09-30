import { render, screen } from '@testing-library/react';
import { PointerEventsCheckLevel, userEvent } from '@testing-library/user-event';
import {
  describe, it, expect, vi,
} from 'vitest';

import { CommentControl } from './PageComment/CommentControl';

import '@testing-library/jest-dom/vitest';

const mocks = vi.hoisted(() => ({
  useIsReadOnlyUserMock: vi.fn(),
  useIsRomUserAllowedToComment: vi.fn(),
}));

// Mock for useIsReadOnlyUser and useIsRomUserAllowedToComment
vi.mock('~/stores-universal/context', () => ({
  useIsReadOnlyUser: mocks.useIsReadOnlyUserMock,
  useIsRomUserAllowedToComment: mocks.useIsRomUserAllowedToComment,
}));

describe('NotAvailableForReadOnlyUser.tsx', () => {

  const onClickEditBtnMock = vi.fn();
  const onClickDeleteBtnMock = vi.fn();
  const user = userEvent.setup({ pointerEventsCheck: PointerEventsCheckLevel.Never });

  it('renders NotAvailable component as enable when user is read-only and comments by rom users is allowed', async() => {
    mocks.useIsReadOnlyUserMock.mockReturnValueOnce({ data: true });
    mocks.useIsRomUserAllowedToComment.mockReturnValueOnce({ data: true });

    render(
      <CommentControl
        onClickEditBtn={onClickEditBtnMock}
        onClickDeleteBtn={onClickDeleteBtnMock}
      />,
    );

    // when
    const button = screen.getByTestId('comment-delete-button');
    // fireEvent.click(button);
    await user.click(button);

    // then
    expect(onClickDeleteBtnMock).toHaveBeenCalled();
    // expect(button).not.toBeDisabled();
  });

  it('renders NotAvailable component as disable when user is read-only and comments by rom users is not allowed', async() => {
    mocks.useIsReadOnlyUserMock.mockReturnValueOnce({ data: true });
    mocks.useIsRomUserAllowedToComment.mockReturnValueOnce({ data: false });

    render(
      <CommentControl
        onClickEditBtn={onClickEditBtnMock}
        onClickDeleteBtn={onClickDeleteBtnMock}
      />,
    );

    // when
    const button = screen.getByTestId('comment-delete-button');
    // fireEvent.click(button);
    await user.click(button);

    // then
    expect(onClickDeleteBtnMock).not.toHaveBeenCalled();
    // expect(button).toBeDisabled();
  });

  it('renders NotAvailable component as enable when user is not read-only and comments by rom users is allowed', async() => {
    mocks.useIsReadOnlyUserMock.mockReturnValueOnce({ data: false });
    mocks.useIsRomUserAllowedToComment.mockReturnValueOnce({ data: true });

    render(
      <CommentControl
        onClickEditBtn={onClickEditBtnMock}
        onClickDeleteBtn={onClickDeleteBtnMock}
      />,
    );

    // when
    const button = screen.getByTestId('comment-delete-button');
    // fireEvent.click(button);
    await user.click(button);

    // then
    expect(onClickDeleteBtnMock).toHaveBeenCalled();
    // expect(button).not.toBeDisabled();
  });

  it('renders NotAvailable component as enable when user is not read-only and comments by rom users is not allowed', async() => {
    mocks.useIsReadOnlyUserMock.mockReturnValueOnce({ data: false });
    mocks.useIsRomUserAllowedToComment.mockReturnValueOnce({ data: false });

    render(
      <CommentControl
        onClickEditBtn={onClickEditBtnMock}
        onClickDeleteBtn={onClickDeleteBtnMock}
      />,
    );

    // when
    const button = screen.getByTestId('comment-delete-button');
    // fireEvent.click(button);
    await user.click(button);

    // then
    expect(onClickDeleteBtnMock).toHaveBeenCalled();
    // expect(button).not.toBeDisabled();
  });

});
