import { useCallback, useState } from 'react';

import loggerFactory from '~/utils/logger';

import { generateInlineCommentAttributes, type InlineCommentAttributes } from './utils';


const logger = loggerFactory('growi:components:InlineCommentForm');


type Props = {
  range: Range,
  onExit?: () => void,
}

export const InlineCommentForm = (props: Props): JSX.Element => {
  const { range, onExit } = props;

  const [input, setInput] = useState('');

  const submitHandler = useCallback(() => {
    const wikiElements = document.getElementsByClassName('wiki');

    if (wikiElements.length === 0) {
      logger.error("'.wiki' element could not be found.");
      return;
    }

    let inlineCommentAttributes: InlineCommentAttributes;
    try {
      inlineCommentAttributes = generateInlineCommentAttributes(range, wikiElements[0]);
    }
    catch (err) {
      logger.error('Generating InlineCommntAttributes failed.', err);
      return;
    }

    console.log({ inlineCommentAttributes });

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
  }, [range, onExit]);

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
