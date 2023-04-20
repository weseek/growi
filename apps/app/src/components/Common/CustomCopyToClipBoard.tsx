import React, { FC, useState, useCallback } from 'react';

import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useTranslation } from 'react-i18next';
import Tooltip from 'reactstrap/es/Tooltip';

type Props = {
  message: string
  textToBeCopied?: string
}

// To get different messages for each copy happend, wrapping CopyToClipBoard and Tooltip together
const CustomCopyToClipBoard: FC<Props> = (props: Props) => {
  const { t } = useTranslation();
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const showToolTip = useCallback(() => {
    setTooltipOpen(true);
    setTimeout(() => {
      setTooltipOpen(false);
    }, 1000);
  }, []);

  return (
    <>
      <CopyToClipboard text={props.textToBeCopied || ''} onCopy={showToolTip}>
        <div className="btn input-group-text" id="tooltipTarget">
          <i className="fa fa-clipboard mx-1" aria-hidden="true"></i>
        </div>
      </CopyToClipboard>
      <Tooltip target="tooltipTarget" fade={false} isOpen={tooltipOpen}>
        {t(props.message)}
      </Tooltip>
    </>
  );
};

export default CustomCopyToClipBoard;
