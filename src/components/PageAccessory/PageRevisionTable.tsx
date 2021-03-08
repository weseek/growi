import { FC } from 'react';

import { Revision as IRevision } from '~/interfaces/page';
import { useTranslation } from '~/i18n';
import Revision from '~/client/js/components/PageHistory/Revision';

type Props = {
  revisions: IRevision[],
  sourceRevision?: IRevision,
  targetRevision?: IRevision,
  latestRevision?: IRevision,
  onClickCompareLatestRevisionButton: (revision:IRevision)=>void,
  onClickComparePreviousRevisionButton: (revision:IRevision, previousRevision:IRevision)=>void,
  onClickSourceRadio: (revision:IRevision)=>void,
  onClickTargetRadio: (revision:IRevision)=>void,
  pagingLimit: number,
}

export const PageRevisionTable:FC<Props> = (props: Props) => {
  const { t } = useTranslation();

  const {
    revisions, sourceRevision, targetRevision, latestRevision, pagingLimit,
  } = props;
  const revisionCount = revisions.length;

  const renderRow = (revision, previousRevision, hasDiff) => {
    const revisionId = revision._id;

    const handleCompareLatestRevisionButton = () => {
      if (props.onClickCompareLatestRevisionButton != null) {
        props.onClickCompareLatestRevisionButton(revision);
      }
    };

    const handleComparePreviousRevisionButton = () => {
      if (props.onClickComparePreviousRevisionButton != null) {
        props.onClickComparePreviousRevisionButton(revision, previousRevision);
      }
    };

    const handleSourceRadio = () => {
      if (props.onClickSourceRadio != null) {
        props.onClickSourceRadio(revision);
      }
    };

    const handleTargetRadio = () => {
      if (props.onClickTargetRadio != null) {
        props.onClickTargetRadio(revision);
      }
    };

    return (
      <tr className="d-flex" key={`revision-history-${revisionId}`}>
        <td className="col" key={`revision-history-top-${revisionId}`}>
          <div className="d-lg-flex">
            <Revision
              t={t}
              revision={revision}
              isLatestRevision={revision === latestRevision}
              hasDiff={hasDiff}
              key={`revision-history-rev-${revisionId}`}
            />
            {hasDiff && (
              <div className="ml-md-3 mt-auto">
                <div className="btn-group">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleCompareLatestRevisionButton}>
                    {t('page_history.compare_latest')}
                  </button>
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleComparePreviousRevisionButton}>
                    {t('page_history.compare_previous')}
                  </button>
                </div>
              </div>
             )}
          </div>
        </td>
        <td className="col-1">
          {(hasDiff || revision._id === sourceRevision?._id) && (
            <div className="custom-control custom-radio custom-control-inline mr-0">
              <input
                type="radio"
                className="custom-control-input"
                id={`compareSource-${revision._id}`}
                name="compareSource"
                value={revision._id}
                checked={revision._id === sourceRevision?._id}
                onChange={handleSourceRadio}
              />
              <label className="custom-control-label" htmlFor={`compareSource-${revision._id}`} />
            </div>
          )}
        </td>
        <td className="col-2">
          {(hasDiff || revision._id === targetRevision?._id) && (
          <div className="custom-control custom-radio custom-control-inline mr-0">
            <input
              type="radio"
              className="custom-control-input"
              id={`compareTarget-${revision._id}`}
              name="compareTarget"
              value={revision._id}
              checked={revision._id === targetRevision?._id}
              onChange={handleTargetRadio}
            />
            <label className="custom-control-label" htmlFor={`compareTarget-${revision._id}`} />
          </div>
            )}
        </td>
      </tr>

    );
  };


  const revisionList = revisions.map((revision, idx) => {
    // Returns null because the last revision is for the bottom diff display
    if (idx === pagingLimit) {
      return null;
    }

    let previousRevision;
    if (idx + 1 < revisionCount) {
      previousRevision = revisions[idx + 1];
    }
    else {
      previousRevision = revision; // if it is the first revision, show full text as diff text
    }

    const hasDiff = revision.hasDiffToPrev !== false; // set 'true' if undefined for backward compatibility

    return renderRow(revision, previousRevision, hasDiff);
  });

  return (
    <table className="table revision-history-table">
      <thead>
        <tr className="d-flex">
          <th className="col">{ t('page_history.revision') }</th>
          <th className="col-1">{ t('page_history.comparing_source') }</th>
          <th className="col-2">{ t('page_history.comparing_target') }</th>
        </tr>
      </thead>
      <tbody className="overflow-auto d-block">
        {revisionList}
      </tbody>
    </table>
  );
};
