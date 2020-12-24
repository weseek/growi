import { FC } from 'react';

type Props= {
  onCLick?: () => void;
  count?: number;
  isLiked?: boolean;
}

export const LikeButton:FC<Props> = (props:Props) => {
  const { onCLick, count = 0, isLiked = false } = props;

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
      className={`btn btn-like border-0 ${isLiked ? 'active' : ''}`}
    >
      <i className="icon-like mr-3" />
      <span className="total-likes">
        {count}
      </span>
    </button>
  );
};
