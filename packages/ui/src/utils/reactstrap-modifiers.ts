import { PopperData, Modifiers } from '~/interfaces/popper-data';

// Conditional modifiers
// To prevent flickering. only happened when `right` is true and persist props should be enabled
export const modifiersForRightAlign: Modifiers = {
  applyStyle: {
    enabled: true,
  },
  computeStyle: {
    enabled: true,
    fn: (data: PopperData): PopperData => {
      const popperRect = data.offsets.popper;
      // Calculate transform styles
      const newTransform = `translate3d(${popperRect.left - window.innerWidth + popperRect.width}px, ${popperRect.top}px, 0px)`;
      const styles = {
        top: '0px',
        right: '0px',
        willChange: 'transform',
        transform: newTransform,
      };
      data.styles = { ...data.styles, ...styles };
      return data;
    },
  },
  preventOverflow: { boundariesElement: 'viewport' },
};
