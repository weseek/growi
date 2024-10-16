import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { PointerEventsCheckLevel, userEvent } from '@testing-library/user-event';
import {
  describe, it, expect, vi,
} from 'vitest';

import { CommentControl } from './PageComment/CommentControl';

const useIsReadOnlyUser = vi.hoisted(() => vi.fn().mockReturnValue({ data: true }));
const useIsRomUserAllowedToComment = vi.hoisted(() => vi.fn().mockReturnValue({ data: true }));

vi.mock('~/stores-universal/context', () => ({
  useIsReadOnlyUser,
  useIsRomUserAllowedToComment,
}));

describe('NotAvailableForReadOnlyUser.tsx', () => {

  const onClickEditBtnMock = vi.fn();
  const onClickDeleteBtnMock = vi.fn();
  const user = userEvent.setup({ pointerEventsCheck: PointerEventsCheckLevel.Never });

  it('renders NotAvailable component as enable when user is read-only and comments by rom users is allowed', async() => {
    useIsReadOnlyUser.mockReturnValue({ data: true });
    useIsRomUserAllowedToComment.mockReturnValue({ data: true });

    render(
      <CommentControl
        onClickEditBtn={onClickEditBtnMock}
        onClickDeleteBtn={onClickDeleteBtnMock}
      />,
    );

    // when
    const button = screen.getByTestId('comment-delete-button');
    const wrapperElement = button.parentElement;
    await user.click(button);

    // then
    expect(onClickDeleteBtnMock).toHaveBeenCalled();
    expect(wrapperElement).not.toHaveAttribute('aria-hidden', 'true');
  });

  it('renders NotAvailable component as disable when user is read-only and comments by rom users is not allowed', async() => {
    useIsReadOnlyUser.mockReturnValue({ data: true });
    useIsRomUserAllowedToComment.mockReturnValue({ data: false });

    render(
      <CommentControl
        onClickEditBtn={onClickEditBtnMock}
        onClickDeleteBtn={onClickDeleteBtnMock}
      />,
    );

    // when
    const button = screen.getByTestId('comment-delete-button');
    const wrapperElement = button.parentElement;

    // then
    expect(wrapperElement).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders NotAvailable component as enable when user is not read-only and comments by rom users is allowed', async() => {
    useIsReadOnlyUser.mockReturnValue({ data: false });
    useIsRomUserAllowedToComment.mockReturnValue({ data: true });

    render(
      <CommentControl
        onClickEditBtn={onClickEditBtnMock}
        onClickDeleteBtn={onClickDeleteBtnMock}
      />,
    );

    // when
    const button = screen.getByTestId('comment-delete-button');
    const wrapperElement = button.parentElement;
    await user.click(button);

    // then
    expect(onClickDeleteBtnMock).toHaveBeenCalled();
    expect(wrapperElement).not.toHaveAttribute('aria-hidden', 'true');
  });

  it('renders NotAvailable component as enable when user is not read-only and comments by rom users is not allowed', async() => {
    useIsReadOnlyUser.mockReturnValue({ data: false });
    useIsRomUserAllowedToComment.mockReturnValue({ data: false });

    render(
      <CommentControl
        onClickEditBtn={onClickEditBtnMock}
        onClickDeleteBtn={onClickDeleteBtnMock}
      />,
    );

    // when
    const button = screen.getByTestId('comment-delete-button');
    const wrapperElement = button.parentElement;
    await user.click(button);

    // then
    expect(onClickDeleteBtnMock).toHaveBeenCalled();
    expect(wrapperElement).not.toHaveAttribute('aria-hidden', 'true');
  });

});
