import path from 'path';

import type { ITemplate } from '@growi/core/dist/interfaces/template';
import dateFnsFormat from 'date-fns/format';
import mustache from 'mustache';

import { useCurrentPagePath } from '~/stores/page';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:components:TemplateModal:use-formatter');


type FormatMethod = (selectedTemplate?: ITemplate) => string;
type FormatterData = {
  format: FormatMethod,
}

export const useFormatter = (): FormatterData => {
  const { data: currentPagePath } = useCurrentPagePath();

  const format: FormatMethod = (selectedTemplate) => {
    if (selectedTemplate == null) {
      return '';
    }

    // replace placeholder
    let markdown = selectedTemplate.markdown;
    const now = new Date();
    try {
      markdown = mustache.render(selectedTemplate.markdown, {
        title: path.basename(currentPagePath ?? '/'),
        path: currentPagePath ?? '/',
        yyyy: dateFnsFormat(now, 'yyyy'),
        MM: dateFnsFormat(now, 'MM'),
        dd: dateFnsFormat(now, 'dd'),
        HH: dateFnsFormat(now, 'HH'),
        mm: dateFnsFormat(now, 'mm'),
      });
    }
    catch (err) {
      logger.warn('An error occured while ejs processing.', err);
    }

    return markdown;
  };

  return { format };
};
