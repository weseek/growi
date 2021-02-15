import { FC, useState } from 'react';
import { useTranslation } from '~/i18n';

// import Revision from './Revision';
// import RevisionDiff from './RevisionDiff';

import { Revision } from '~/interfaces/page';

type Props = {
  revisions: Revision[];
  pagingLimit: number;
}


/**
 * render a row (Revision component and RevisionDiff component)
 * @param {Revison} revision
 * @param {Revision} previousRevision
 * @param {boolean} hasDiff whether revision has difference to previousRevision
 * @param {boolean} isContiguousNodiff true if the current 'hasDiff' and one of previous row is both false
 */
const RevisionList:FC = () => {
  return <p>hoge</p>;
};

export const PageRevisionList :FC<Props> = (props:Props) => {
  const { revisions, pagingLimit } = props;
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

    return <RevisionList revision={revision} previousRevision={previousRevision} hasDiff={hasDiff} isContiguousNodiff={isContiguousNodiff} />;
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

// class DeprecatePageRevisionList extends React.Component {

//   constructor(props) {
//     super(props);

//     this.state = {
//       isCompactNodiffRevisions: true,
//     };

//     this.cbCompactizeChangeHandler = this.cbCompactizeChangeHandler.bind(this);
//   }

//   cbCompactizeChangeHandler() {
//     this.setState({ isCompactNodiffRevisions: !this.state.isCompactNodiffRevisions });
//   }

//   /**
//    * render a row (Revision component and RevisionDiff component)
//    * @param {Revison} revision
//    * @param {Revision} previousRevision
//    * @param {boolean} hasDiff whether revision has difference to previousRevision
//    * @param {boolean} isContiguousNodiff true if the current 'hasDiff' and one of previous row is both false
//    */
//   renderRow(revision, previousRevision, hasDiff, isContiguousNodiff) {
//     const revisionId = revision._id;
//     const revisionDiffOpened = this.props.diffOpened[revisionId] || false;

//     const classNames = ['revision-history-outer'];
//     if (isContiguousNodiff) {
//       classNames.push('revision-history-outer-contiguous-nodiff');
//     }

//     return (
//       <div className={classNames.join(' ')} key={`revision-history-${revisionId}`}>
//         <Revision
//           t={this.props.t}
//           revision={revision}
//           revisionDiffOpened={revisionDiffOpened}
//           hasDiff={hasDiff}
//           isCompactNodiffRevisions={this.state.isCompactNodiffRevisions}
//           onDiffOpenClicked={this.props.onDiffOpenClicked}
//           key={`revision-history-rev-${revisionId}`}
//         />
//         { hasDiff
//           && (
//           <RevisionDiff
//             revisionDiffOpened={revisionDiffOpened}
//             currentRevision={revision}
//             previousRevision={previousRevision}
//             key={`revision-deff-${revisionId}`}
//           />
//           )
//         }
//       </div>
//     );
//   }


// PageRevisionList.propTypes = {
//   pageHistoryContainer: PropTypes.instanceOf(PageHistroyContainer).isRequired,

//   revisions: PropTypes.array,
//   diffOpened: PropTypes.object,
//   onDiffOpenClicked: PropTypes.func.isRequired,
// };
