// @vitest-environment happy-dom

import type { ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'jotai';

import { scheduleToPut } from '~/client/services/user-ui-settings';

import { ChatSidebarResizableContainer } from './ChatSidebarResizableContainer';

const VIEWPORT_WIDTH = 1280;

const { deviceState } = vi.hoisted(() => ({
  deviceState: { isLargerThanSm: true },
}));
vi.mock('~/states/ui/device', () => ({
  useDeviceLargerThanSm: () => [deviceState.isLargerThanSm, vi.fn()] as const,
}));

vi.mock('~/client/services/user-ui-settings', () => ({
  scheduleToPut: vi.fn(),
}));

beforeAll(() => {
  Object.defineProperty(document.documentElement, 'clientWidth', {
    configurable: true,
    value: VIEWPORT_WIDTH,
  });
});

beforeEach(() => {
  vi.clearAllMocks();
  deviceState.isLargerThanSm = true;
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider>{children}</Provider>
);

const renderContainer = () => {
  return render(
    <ChatSidebarResizableContainer>
      <div>content</div>
    </ChatSidebarResizableContainer>,
    { wrapper },
  );
};

// The resizable area is the element that directly wraps the children
const getResizableArea = (): HTMLElement => {
  const area = screen.getByText('content').parentElement;
  if (area == null) throw new Error('resizable area not rendered');
  return area;
};

const queryHandle = () =>
  screen.queryByRole('button', { name: 'Resize sidebar' });

describe('ChatSidebarResizableContainer', () => {
  describe('on a viewport at or above the sm breakpoint', () => {
    it('renders at the stored width with a resize handle', () => {
      renderContainer();

      expect(getResizableArea().style.width).toBe('500px');
      expect(queryHandle()).not.toBeNull();
    });

    it('keeps the content clipped inside the panel', () => {
      renderContainer();

      expect(getResizableArea().classList.contains('overflow-hidden')).toBe(
        true,
      );
    });

    it('applies the dragged width and persists it on release', () => {
      renderContainer();
      const handle = queryHandle();
      if (handle == null) throw new Error('handle not rendered');

      fireEvent.mouseDown(handle, { clientX: VIEWPORT_WIDTH - 500 });
      fireEvent.mouseMove(document, { clientX: VIEWPORT_WIDTH - 640 });

      expect(getResizableArea().style.width).toBe('640px');
      expect(scheduleToPut).not.toHaveBeenCalled();

      fireEvent.mouseUp(document, { clientX: VIEWPORT_WIDTH - 640 });

      expect(getResizableArea().style.width).toBe('640px');
      expect(scheduleToPut).toHaveBeenCalledWith({ aiChatSidebarWidth: 640 });
    });

    it('does not grow beyond the viewport-based maximum', () => {
      renderContainer();
      const handle = queryHandle();
      if (handle == null) throw new Error('handle not rendered');

      fireEvent.mouseDown(handle, { clientX: VIEWPORT_WIDTH - 500 });
      fireEvent.mouseMove(document, { clientX: 0 });
      fireEvent.mouseUp(document, { clientX: 0 });

      // min(960, 1280 - 320) = 960
      expect(getResizableArea().style.width).toBe('960px');
      expect(scheduleToPut).toHaveBeenCalledWith({ aiChatSidebarWidth: 960 });
    });
  });

  describe('on a viewport below the sm breakpoint', () => {
    it('renders full width without a resize handle', () => {
      deviceState.isLargerThanSm = false;
      renderContainer();

      expect(getResizableArea().style.width).toBe('');
      expect(getResizableArea().classList.contains('w-100')).toBe(true);
      expect(queryHandle()).toBeNull();
    });
  });

  it('follows the breakpoint when it changes', () => {
    const { rerender } = renderContainer();
    expect(queryHandle()).not.toBeNull();

    deviceState.isLargerThanSm = false;
    rerender(
      <ChatSidebarResizableContainer>
        <div>content</div>
      </ChatSidebarResizableContainer>,
    );
    expect(queryHandle()).toBeNull();
    expect(getResizableArea().style.width).toBe('');

    deviceState.isLargerThanSm = true;
    rerender(
      <ChatSidebarResizableContainer>
        <div>content</div>
      </ChatSidebarResizableContainer>,
    );
    expect(queryHandle()).not.toBeNull();
    expect(getResizableArea().style.width).toBe('500px');
  });
});
