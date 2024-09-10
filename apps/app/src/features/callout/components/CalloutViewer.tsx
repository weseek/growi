// Ref: https://github.com/Microflash/remark-callout-directives/blob/fabe4d8adc7738469f253836f0da346591ea2a2b/README.md

import type { ReactNode } from 'react';
import React from 'react';

import { githubCallout } from '../services/consts';

import styles from './CalloutViewer.module.scss';

const moduleClass = styles['callout-viewer'];

type CalloutViewerProps = {
  children: ReactNode,
  node: Element,
  name: string
}

export const CalloutViewer = React.memo((props: CalloutViewerProps): JSX.Element => {

  const { node, name, children } = props;

  if (node == null) {
    return <></>;
  }

  return (
    <div className={`${moduleClass} callout-viewer`}>
      <div className={`callout callout-${githubCallout[name].title.toLowerCase()}`}>
        <div className="callout-indicator">
          {/* eslint-disable-next-line react/no-danger */}
          <div className="callout-hint" dangerouslySetInnerHTML={{ __html: githubCallout[name].hint ?? '' }}>
          </div>
          <div className="callout-title">
            {githubCallout[name].title}
          </div>
        </div>
        <div className="callout-content">
          {children}
        </div>
      </div>
    </div>
  );
});
CalloutViewer.displayName = 'CalloutViewer';
