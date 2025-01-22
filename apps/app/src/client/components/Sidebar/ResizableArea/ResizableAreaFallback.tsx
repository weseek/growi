import { memo } from 'react';


type Props = {
  className?: string,
  width?: number,
  children?: React.ReactNode,
}

export const ResizableAreaFallback = memo((props: Props): React.ReactElement => {
  const {
    className = '',
    width,
    children,
  } = props;

  return (
    <div
      className={className}
      style={{ width }}
    >
      {children}
    </div>
  );
});
