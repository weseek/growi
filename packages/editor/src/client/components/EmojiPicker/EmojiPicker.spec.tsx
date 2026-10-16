import { act, fireEvent, render, screen } from '@testing-library/react';

import type { EmojiPicker as EmojiPickerComponent } from './EmojiPicker.js';

const loadCounter = { picker: 0, data: 0 };

describe('EmojiPicker', () => {
  let EmojiPicker: typeof EmojiPickerComponent;

  // Register the mocks and re-import the component per test so the load counter
  // reflects only this test, regardless of test order.
  beforeEach(async () => {
    loadCounter.picker = 0;
    loadCounter.data = 0;
    vi.resetModules();
    vi.doMock('@emoji-mart/react', () => {
      loadCounter.picker += 1;
      return {
        default: (props: {
          onEmojiSelect: (emoji: { id: string; skin?: number }) => void;
        }) => (
          <div data-testid="fake-picker">
            <button
              type="button"
              onClick={() => props.onEmojiSelect({ id: 'thumbsup', skin: 3 })}
            >
              pick-with-skin
            </button>
            <button
              type="button"
              onClick={() => props.onEmojiSelect({ id: 'smile' })}
            >
              pick-without-skin
            </button>
          </div>
        ),
      };
    });
    vi.doMock('@emoji-mart/data', () => {
      loadCounter.data += 1;
      return { default: { emojis: {} } };
    });
    ({ EmojiPicker } = await import('./EmojiPicker.js'));
  });

  it('does not load the picker or emoji data while it has never been opened', async () => {
    const { container } = render(
      <EmojiPicker isOpen={false} onSelect={vi.fn()} onClose={vi.fn()} />,
    );
    await act(async () => {});

    expect(loadCounter).toEqual({ picker: 0, data: 0 });
    expect(screen.queryByTestId('fake-picker')).toBeNull();
    expect(container.textContent).toBe('');
  });

  it('loads and shows the picker once it is opened', async () => {
    const { rerender } = render(
      <EmojiPicker isOpen={false} onSelect={vi.fn()} onClose={vi.fn()} />,
    );
    rerender(<EmojiPicker isOpen onSelect={vi.fn()} onClose={vi.fn()} />);

    expect(await screen.findByTestId('fake-picker')).toBeTruthy();
    expect(loadCounter).toEqual({ picker: 1, data: 1 });
  });

  it('passes the emoji id and skin tone number to onSelect', async () => {
    const onSelect = vi.fn();
    render(<EmojiPicker isOpen onSelect={onSelect} onClose={vi.fn()} />);

    fireEvent.click(await screen.findByText('pick-with-skin'));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith({ id: 'thumbsup', skin: 3 });
  });

  it('passes only the id when the emoji has no skin tone', async () => {
    const onSelect = vi.fn();
    render(<EmojiPicker isOpen onSelect={onSelect} onClose={vi.fn()} />);

    fireEvent.click(await screen.findByText('pick-without-skin'));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0]).toMatchObject({ id: 'smile' });
    expect(onSelect.mock.calls[0][0].skin).toBeUndefined();
  });

  it('calls onClose and never onSelect when dismissed without a selection', async () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(<EmojiPicker isOpen onSelect={onSelect} onClose={onClose} />);
    await screen.findByTestId('fake-picker');

    const modal = document.querySelector('.modal');
    expect(modal).not.toBeNull();
    fireEvent.keyUp(modal as Element, { key: 'Escape', keyCode: 27 });

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSelect).not.toHaveBeenCalled();
  });
});
