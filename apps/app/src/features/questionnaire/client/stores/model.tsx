import { useStaticSWR } from '~/stores/use-static-swr';
import loggerFactory from '~/utils/logger';
import { SWRResponse } from 'swr';

const logger = loggerFactory('growi:stores:modal');

/*
* QuestionnaireModals
*/
type QuestionnaireModalStatuses = {
  openedQuestionnaireId: string | null,
  closeToast?: () => void | Promise<void>,
}

type QuestionnaireModalStatusUtils = {
  open(string: string, closeToast: () => void | Promise<void>): Promise<QuestionnaireModalStatuses | undefined>
  close(shouldCloseToast?: boolean): Promise<QuestionnaireModalStatuses | undefined>
}

export const useQuestionnaireModal = (status?: QuestionnaireModalStatuses): SWRResponse<QuestionnaireModalStatuses, Error> & QuestionnaireModalStatusUtils => {
  const initialData: QuestionnaireModalStatuses = { openedQuestionnaireId: null };
  const swrResponse = useStaticSWR<QuestionnaireModalStatuses, Error>('questionnaireModalStatus', status, { fallbackData: initialData });

  return {
    ...swrResponse,
    open: (questionnaireOrderId: string, closeToast: () => void | Promise<void>) => swrResponse.mutate({
      openedQuestionnaireId: questionnaireOrderId,
      closeToast,
    }),
    close: (shouldCloseToast?: boolean) => {
      if (shouldCloseToast) {
        swrResponse.data?.closeToast?.();
        if (swrResponse.data?.closeToast === undefined) logger.debug('Tried to run `swrResponse.data?.closeToast` but it was `undefined`');
      }

      return swrResponse.mutate({ openedQuestionnaireId: null });
    },
  };
};/
