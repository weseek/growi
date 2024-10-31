// Ref: https://github.com/Microflash/remark-callout-directives/blob/fabe4d8adc7738469f253836f0da346591ea2a2b/README.md

import type { ReactNode } from 'react';
import React from 'react';

import { type Callout } from '../services/consts';

import styles from './CalloutViewer.module.scss';

const moduleClass = styles['callout-viewer'];

type CALLOUT_TO = {
  [key in Callout]: string;
}

const CALLOUT_TO_TITLE: CALLOUT_TO = {
  note: 'Note',
  tip: 'Tip',
  important: 'Important',
  info: 'Important',
  warning: 'Warning',
  caution: 'Caution',
  danger: 'Caution',
};

const CALLOUT_TO_ICON: CALLOUT_TO = {
  note: 'info',
  tip: 'lightbulb',
  important: 'feedback',
  info: 'feedback',
  warning: 'warning',
  caution: 'report',
  danger: 'report',
};

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
      <div className={`callout callout-${CALLOUT_TO_TITLE[name].toLowerCase()}`}>
        <div className="callout-indicator">
          <div className="callout-hint">
            <span className="material-symbols-outlined">{CALLOUT_TO_ICON[name]}</span>
          </div>
          <div className="callout-title">
            {CALLOUT_TO_TITLE[name]}
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
