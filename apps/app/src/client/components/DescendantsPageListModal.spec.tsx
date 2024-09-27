import { render, screen, fireEvent } from '@testing-library/react';
import { SWRConfig } from 'swr';

import { DescendantsPageListModal } from './DescendantsPageListModal';

let breakpointPixel; // Variable to hold the current breakpoint pixel
let mockMatchMedia;

const defaultBreakpointPixel = '992px';
const mockClose = vi.hoisted(() => vi.fn());

const setMatchMedia = (breakpointPixel) => {
  const expectedQuery = `(min-width: ${breakpointPixel})`;
  mockMatchMedia.mockImplementationOnce(query => ({
    matches: query === expectedQuery,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

// Determine the breakpoint pixel based on window width
const getBreakpointPixel = (windowWidth) => {
  if (windowWidth >= 992) return '992px'; // lg
  if (windowWidth >= 768) return '768px'; // md
  if (windowWidth >= 576) return '576px'; // sm
  return '0'; // xs
};

// Set the window width and update the breakpoint pixel
const setWindowWidth = (windowWidth) => {
  Object.defineProperty(window, 'innerWidth', { value: windowWidth });
  breakpointPixel = getBreakpointPixel(windowWidth);
  setMatchMedia(breakpointPixel);
};

vi.mock('next/router', () => ({
  useRouter: () => ({
    events: {
      on: vi.fn(),
      off: vi.fn(),
    },
  }),
}));

vi.mock('~/stores/modal', () => ({
  useDescendantsPageListModal: vi.fn().mockReturnValue({
    data: { isOpened: true },
    close: mockClose,
  }),
}));

Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: (prop: string) => (prop === '--bs-breakpoint-lg' ? '992px' : ''),
  }),
});

describe('DescendantsPageListModal.tsx', () => {
  beforeEach(() => {
    mockMatchMedia = vi.fn();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      enumerable: true,
      value: mockMatchMedia,
    });

    // Default settings for matchMedia
    mockMatchMedia.mockImplementation((query: string) => ({
      matches: query === `(min-width: ${defaultBreakpointPixel})`,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it('should render the modal when isOpened is true', () => {
    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <DescendantsPageListModal />
      </SWRConfig>,
    );
    expect(screen.getByTestId('descendants-page-list-modal')).not.toBeNull();
  });

  it('should call close function when close button is clicked', () => {
    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <DescendantsPageListModal />
      </SWRConfig>,
    );
    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);
    expect(mockClose).toHaveBeenCalled();
  });

  it('should render CustomNavTab responsively', () => {
    const { unmount } = render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <DescendantsPageListModal />
      </SWRConfig>,
    );
    expect(screen.getByTestId('custom-nav-tab')).not.toBeNull();

    unmount(); // Unmount the component to remove the result of the first render
    setWindowWidth(500); // Simulate a smaller screen size

    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <DescendantsPageListModal />
      </SWRConfig>,
    );
    expect(screen.queryByTestId('custom-nav-tab')).toBeNull();
  });

  it('should render CustomNavDropdown responsively', () => {
    const { unmount } = render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <DescendantsPageListModal />
      </SWRConfig>,
    );
    expect(screen.queryByTestId('custom-nav-dropdown')).toBeNull();

    unmount(); // Unmount the component to remove the result of the first render
    setWindowWidth(500); // Simulate a smaller screen size

    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <DescendantsPageListModal />
      </SWRConfig>,
    );
    expect(screen.getByTestId('custom-nav-dropdown')).not.toBeNull();
  });
});
