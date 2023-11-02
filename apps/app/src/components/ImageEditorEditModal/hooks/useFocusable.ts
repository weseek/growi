import { useState } from 'react';

export const useFocusable = () => {
  const [focused, setFocused] = useState<string | null>(null);

  const unfocus = (e?) => {
    if (e === undefined) {
      setFocused(null);
      return;
    }

    const emptyClicked = e.target === e.target.getStage();

    if (emptyClicked) {
      setFocused(null);
    }
  };

  return {
    focused,
    setFocused,
    unfocus,
  };
};
