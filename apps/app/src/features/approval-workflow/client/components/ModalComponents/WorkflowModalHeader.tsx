import React, { useMemo } from 'react';

import { ModalHeader } from 'reactstrap';

import ExpandOrContractButton from '~/components/ExpandOrContractButton';

import { useWorkflowModal } from '../../stores/workflow';

type Props = {
  children: React.ReactNode,
  onClickPageBackButton?: () => void,
}

export const WorkflowModalHeader = (props: Props): JSX.Element => {
  const { children, onClickPageBackButton } = props;

  const {
    data, close, expand, contract,
  } = useWorkflowModal();

  const rightButtons = useMemo(() => {
    return (
      <span className="text-muted">
        <ExpandOrContractButton isWindowExpanded={data?.isExpanded ?? false} expandWindow={expand} contractWindow={contract} />

        <button type="button" className="btn btn-close" onClick={close} aria-label="Close" />
      </span>
    );
  }, [close, contract, data?.isExpanded, expand]);


  return (
    <ModalHeader close={rightButtons}>
      <div className="d-flex align-items-center">
        { onClickPageBackButton != null && (
          <button type="button" className="btn d-flex justify-content-center p-0 me-3" onClick={onClickPageBackButton}>
            <span className="fs-1 material-symbols-outlined" aria-hidden="true">chevron_left</span>
          </button>
        ) }

        {children}
      </div>
    </ModalHeader>
  );
};
