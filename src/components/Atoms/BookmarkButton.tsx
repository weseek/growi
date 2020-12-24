import { FC } from 'react';

type Props= {
  onCLick?: () => void;
  count?: number;
  isBookmarked?: boolean;
}

export const BookmarkButton:FC<Props> = (props:Props) => {
  const { onCLick, count = 0, isBookmarked = false } = props;

  const handleClick = () => {
    if (onCLick == null) {
      return;
    }
    onCLick();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`btn btn-bookmark border-0 ${isBookmarked ? 'active' : ''}`}
    >
      <i className="icon-star mr-3" />
      <span className="total-bookmarks">
        {count}
      </span>
    </button>
  );
};
