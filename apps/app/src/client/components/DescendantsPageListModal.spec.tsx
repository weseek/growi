import { render, screen, fireEvent } from '@testing-library/react';
import { SWRConfig } from 'swr';

import { DescendantsPageListModal } from './DescendantsPageListModal';

let mockMatchMedia;

const mockClose = vi.hoisted(() => vi.fn());

const setMatchMedia = (matches) => {
  mockMatchMedia.mockImplementationOnce(query => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
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

describe('DescendantsPageListModal.tsx', () => {
  beforeEach(() => {
    mockMatchMedia = vi.fn();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      enumerable: true,
      value: mockMatchMedia,
    });

    // default settings
    mockMatchMedia.mockImplementation(query => ({
      matches: true, // set true
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
    render(<DescendantsPageListModal />);
    expect(screen.getByTestId('descendants-page-list-modal')).not.toBeNull();
  });

  it('should call close function when close button is clicked', () => {
    render(<DescendantsPageListModal />);
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

    // The rendered component to be unmounted
    unmount();

    // Set isDeviceLargerThanLg to false by simulating a smaller screen size
    setMatchMedia(false);

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

    // The rendered component to be unmounted
    unmount();

    // Set isDeviceLargerThanLg to false by simulating a smaller screen size
    setMatchMedia(false);

    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <DescendantsPageListModal />
      </SWRConfig>,
    );

    expect(screen.getByTestId('custom-nav-dropdown')).not.toBeNull();
  });
});
