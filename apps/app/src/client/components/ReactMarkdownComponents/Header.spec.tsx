import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const mockStartEditing = vi.hoisted(() => vi.fn());
const mockUseCurrentPagePath = vi.hoisted(() => vi.fn());

vi.mock('~/client/services/use-start-editing', () => ({
  useStartEditing: () => mockStartEditing,
}));
vi.mock('~/states/page', () => ({
  useCurrentPagePath: mockUseCurrentPagePath,
}));

const { EditLink } = await import('./Header');

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('EditLink', () => {
  it('marks the icon as decorative so screen readers do not read it out', () => {
    mockUseCurrentPagePath.mockReturnValue('/test/page');
    mockStartEditing.mockResolvedValue(undefined);

    const { container } = render(<EditLink line={1} />);

    const icon = container.querySelector('.material-symbols-outlined');
    expect(icon).not.toBeNull();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    // The visible glyph text itself must remain unchanged
    expect(icon).toHaveTextContent('edit_square');
  });

  it('keeps the button enabled and wired to startEditing when a line is provided', () => {
    mockUseCurrentPagePath.mockReturnValue('/test/page');
    mockStartEditing.mockResolvedValue(undefined);

    const { container } = render(<EditLink line={5} />);

    const button = container.querySelector('button');
    expect(button).not.toBeNull();
    expect(button).not.toBeDisabled();

    fireEvent.click(button as HTMLButtonElement);
    expect(mockStartEditing).toHaveBeenCalledWith('/test/page');
  });

  it('disables the button when no line is provided', () => {
    mockUseCurrentPagePath.mockReturnValue('/test/page');

    const { container } = render(<EditLink />);

    const button = container.querySelector('button');
    expect(button).toBeDisabled();
  });
});
