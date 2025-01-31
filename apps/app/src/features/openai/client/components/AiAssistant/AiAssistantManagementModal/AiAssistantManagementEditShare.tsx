import React, { useCallback } from 'react';

import { ModalBody } from 'reactstrap';

import type { IPageForItem } from '~/interfaces/page';
import { usePageSelectModal } from '~/stores/modal';

import type { SelectedPage } from '../../../../interfaces/selected-page';
import { SelectedPageList } from '../../Common/SelectedPageList';

import { AiAssistantManagementHeader } from './AiAssistantManagementHeader';


type Props = {
  //
}

export const AiAssistantManagementEditShare = (props: Props): JSX.Element => {

  return (
    <>
      <AiAssistantManagementHeader />

      <ModalBody className="px-4">

      </ModalBody>
    </>
  );
};
