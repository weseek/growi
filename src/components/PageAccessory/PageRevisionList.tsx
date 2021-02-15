import { FC, useState } from 'react';
import { useTranslation } from '~/i18n';

// import Revision from './Revision';
// import RevisionDiff from './RevisionDiff';

import { Revision } from '~/interfaces/page';


type RevisionRowProps = {
  revision: Revision;
  previousRevision: Revision;
  isContiguousNodiff: boolean;
  hasDiff: boolean;
  revisionDiffOpened: boolean;
}


/**
 * render a row (Revision component and RevisionDiff component)
 */
const RevisionRow:FC<RevisionRowProps> = (props:RevisionRowProps) => {
  const { revision, isContiguousNodiff, hasDiff } = props;

  const classNames = ['revision-history-outer'];
  if (isContiguousNodiff) {
    classNames.push('revision-history-outer-contiguous-nodiff');
  }

  return (
    <div className={classNames.join(' ')} key={`revision-history-${revision._id}`}>
      {/* <Revision
        t={this.props.t}
        revision={revision}
        revisionDiffOpened={revisionDiffOpened}
        hasDiff={hasDiff}
        isCompactNodiffRevisions={this.state.isCompactNodiffRevisions}
        onDiffOpenClicked={this.props.onDiffOpenClicked}
        key={`revision-history-rev-${revisionId}`}
      />
      { hasDiff
          && (
          <RevisionDiff
            revisionDiffOpened={revisionDiffOpened}
            currentRevision={revision}
            previousRevision={previousRevision}
            key={`revision-deff-${revisionId}`}
          />
          )
        } */}
    </div>
  );
};

type PageRevisionListProps = {
  revisions: Revision[];
  pagingLimit: number;
  diffOpened: { [id: string]: boolean };
  onDiffOpenClicked?: ()=>void;
}

export const PageRevisionList :FC<PageRevisionListProps> = (props:PageRevisionListProps) => {
  const {
    revisions, pagingLimit, diffOpened, onDiffOpenClicked,
  } = props;
  const revisionCount = revisions.length;

  const { t } = useTranslation();
  const [isCompactNodiffRevisions, setIsCompactNodiffRevisions] = useState(false);
  let hasDiffPrev;

  const classNames:string[] = ['revision-history-list'];
  if (isCompactNodiffRevisions) {
    classNames.push('revision-history-list-compact');
  }

  const cbCompactizeChangeHandler = () => {
    setIsCompactNodiffRevisions(!isCompactNodiffRevisions);
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
    const isContiguousNodiff = !hasDiff && !hasDiffPrev;

    hasDiffPrev = hasDiff;

    return (
      <RevisionRow
        revision={revision}
        previousRevision={previousRevision}
        isContiguousNodiff={isContiguousNodiff}
        hasDiff={hasDiffPrev}
        revisionDiffOpened={diffOpened[revision._id] || false}
      />
    );
  });

  return (
    <>
      <div className="custom-control custom-checkbox custom-checkbox-info float-right">
        <input
          type="checkbox"
          id="cbCompactize"
          className="custom-control-input"
          checked={isCompactNodiffRevisions}
          onChange={cbCompactizeChangeHandler}
        />
        <label className="custom-control-label" htmlFor="cbCompactize">{ t('Shrink versions that have no diffs') }</label>
      </div>
      <div className="clearfix"></div>
      <div className={classNames.join(' ')}>
        {revisionList}
      </div>
    </>
  );
};
