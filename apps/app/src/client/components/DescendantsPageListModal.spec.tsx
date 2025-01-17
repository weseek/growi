import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';

import '@testing-library/jest-dom/vitest';

import { DescendantsPageListModal } from './DescendantsPageListModal';

const mockClose = vi.hoisted(() => vi.fn());
const useIsDeviceLargerThanLg = vi.hoisted(() => vi.fn().mockReturnValue({ data: true }));

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

vi.mock('~/stores/ui', () => ({
  useIsDeviceLargerThanLg,
}));

describe('DescendantsPageListModal.tsx', () => {

  it('should render the modal when isOpened is true', async() => {
    render(<DescendantsPageListModal />);

    await waitFor(() => {
      expect(screen.getByTestId('descendants-page-list-modal')).toBeInTheDocument();
    });
  });

  it('should call close function when close button is clicked', async() => {
    render(<DescendantsPageListModal />);

    const closeButton = await waitFor(() => screen.getByLabelText('Close'));

    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe('when device is larger than lg', () => {

    it('should render CustomNavTab', async() => {
      render(<DescendantsPageListModal />);

      await waitFor(() => {
        expect(screen.getByTestId('custom-nav-tab')).toBeInTheDocument();
      });
    });

    it('should not render CustomNavDropdown', async() => {
      render(<DescendantsPageListModal />);

      await waitFor(() => {
        expect(screen.queryByTestId('custom-nav-dropdown')).not.toBeInTheDocument();
      });
    });
  });

  describe('when device is smaller than lg', () => {
    beforeEach(() => {
      useIsDeviceLargerThanLg.mockReturnValue({ data: false });
    });

    it('should render CustomNavDropdown on devices smaller than lg', async() => {
      render(<DescendantsPageListModal />);

      await waitFor(() => {
        expect(screen.getByTestId('custom-nav-dropdown')).toBeInTheDocument();
      });
    });

    it('should not render CustomNavTab', async() => {
      render(<DescendantsPageListModal />);

      await waitFor(() => {
        expect(screen.queryByTestId('custom-nav-tab')).not.toBeInTheDocument();
      });
    });
  });
});
