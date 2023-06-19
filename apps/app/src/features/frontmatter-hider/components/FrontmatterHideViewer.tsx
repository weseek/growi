import React, { ReactNode } from 'react';


type FrontmatterHideViewerProps = {
  children: ReactNode,
}

export const FrontmatterHideViewer = React.memo((props: FrontmatterHideViewerProps): JSX.Element => {
  const { children } = props;
  return <></>;
});
FrontmatterHideViewer.displayName = 'FronttmatterHideViewer';
