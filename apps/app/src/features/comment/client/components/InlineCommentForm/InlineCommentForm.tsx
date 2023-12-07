import { useCallback, useState } from 'react';

import { IInlineCommentAttributes } from '@growi/core';

import { toastError } from '~/client/util/toastr';
import loggerFactory from '~/utils/logger';

import { usePostComment } from '../../services';

import { generateInlineCommentAttributes } from './utils';


const logger = loggerFactory('growi:components:InlineCommentForm');


type Props = {
  range: Range,
  onExit?: () => void,
}

export const InlineCommentForm = (props: Props): JSX.Element => {
  const { range, onExit } = props;

  const [input, setInput] = useState('');

  const postComment = usePostComment();

  const submitHandler = useCallback(async() => {
    const wikiElements = document.getElementsByClassName('wiki');

    if (wikiElements.length === 0) {
      logger.error("'.wiki' element could not be found.");
      return;
    }

    let inlineCommentAttributes: IInlineCommentAttributes;
    try {
      inlineCommentAttributes = generateInlineCommentAttributes(range, wikiElements[0]);
    }
    catch (err) {
      logger.error('Generating InlineCommntAttributes failed.', err);
      return;
    }

    try {
      await postComment({
        commentForm: {
          comment: 'inline comment test',
          inline: true,
          ...inlineCommentAttributes,
        },
      });
    }
    catch (err) {
      toastError(err);
      logger.error(err);
      return;
    }

    // const targetElement = getElementByXpath(wikiElemXpath + xpathRelative);
    // if (targetElement != null && isElement(targetElement)) {
    //   // WIP: restore annotated html from xpathRelative
    //   console.log('replace innerHTML');
    //   targetElement.innerHTML = annotated;

    //   // WIP: react rendering
    //   const annotatedElem = targetElement.getElementsByClassName('annotation-0');
    //   console.log({ annotatedElem });
    //   createPortal(
    //     <p>aaaaa</p>,
    //     annotatedElem[0],
    //   );
    // }

    onExit?.();
  }, [onExit, range, postComment]);

  return (
    <form onSubmit={submitHandler}>
      <div className="d-flex gap-1">
        <input
          type="text"
          className="form-control form-control-sm border-0"
          autoFocus
          placeholder="Input comment.."
          onChange={e => setInput(e.target.value)}
          aria-describedby="inlineComment"
        />
        <button type="button" className="btn btn-sm btn-muted">
          <span className="material-symbols-outlined">alternate_email</span>
        </button>
        <button type="button" className="btn btn-sm btn-muted" onClick={submitHandler}>
          <span className="material-symbols-outlined">send</span>
        </button>
      </div>
    </form>
  );
};
