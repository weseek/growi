import React, { useState } from 'react';

import { useTranslation } from 'next-i18next';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import ReactMarkdown from 'react-markdown';
import {
  Collapse,
  UncontrolledTooltip,
} from 'reactstrap';

import { useDraftOptions } from '~/stores/renderer';

type DraftProps = {
  path: string,
  isExist: boolean,
  index: number,
  markdown: string,
  clearDraft: (path: string) => void,
}

export const Draft = (props: DraftProps): JSX.Element => {

  const {
    path, isExist, index, markdown, clearDraft,
  } = props;
  const { t } = useTranslation();
  const { data: rendererOptions } = useDraftOptions();
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  const changeToolTipLabel = () => {
    setShowCopiedMessage(true);
    setTimeout(() => {
      setShowCopiedMessage(false);
    }, 1000);
  };

  const collapsePanelHandler = () => {
    setIsPanelExpanded(false);
  };

  const expandPanelHandler = () => {
    setIsPanelExpanded(true);
  };

  const Controls = () => {

    const tooltipTargetId = `draft-copied-tooltip_${index}`;

    return (
      <div className="icon-container">
        {isExist
          ? null
          : (
            <a
              href={`${path}#edit`}
              target="_blank"
              rel="noopener noreferrer"
              data-toggle="tooltip"
              title={t('Edit')}
            >
              <i className="mx-2 icon-note" />
            </a>
          )
        }
        <span id={tooltipTargetId}>
          <CopyToClipboard text={markdown} onCopy={changeToolTipLabel}>
            <a
              className="text-center draft-copy"
            >
              <i className="mx-2 ti-clipboard" />
            </a>
          </CopyToClipboard>
        </span>
        <UncontrolledTooltip placement="top" target={tooltipTargetId} fade={false} trigger="hover">
          { showCopiedMessage && (
            <strong>copied!</strong>
          ) }
          { !showCopiedMessage && (
            <span>{t('Copy')}</span>
          ) }
        </UncontrolledTooltip>
        <a
          className="text-danger text-center"
          data-toggle="tooltip"
          data-placement="top"
          title={t('Delete')}
          onClick={() => { return clearDraft(path) }}
        >
          <i className="mx-2 icon-trash" />
        </a>
      </div>
    );
  };

  const AccordionTitle = () => {
    const iconClass = isPanelExpanded ? 'fa-rotate-90' : '';

    return (
      <span>

        <span className="mr-2 draft-path" onClick={() => setIsPanelExpanded(!isPanelExpanded)}>
          <i className={`fa fa-fw fa-angle-right mr-2 ${iconClass}`}></i>
          {path}
        </span>
        { isExist && (
          <span className="badge badge-warning">{t('page exists')}</span>
        ) }
        { !isExist && (
          <span className="badge badge-info">draft</span>
        ) }

        <a className="ml-2" href={path}><i className="icon icon-login"></i></a>
      </span>
    );
  };


  return (
    <div className="accordion draft-list-item" role="tablist">
      <div className="card">

        <div className="card-header d-flex" role="tab">
          <AccordionTitle/>

          <div className="flex-grow-1"></div>

          <Controls/>
        </div>

        <Collapse isOpen={isPanelExpanded} onEntering={expandPanelHandler} onExiting={collapsePanelHandler}>
          <div className="card-body">
            { isPanelExpanded && (
              <ReactMarkdown {...rendererOptions} className='wiki'>
                {markdown}
              </ReactMarkdown>
            ) }
          </div>
        </Collapse>

      </div>
    </div>
  );
};
