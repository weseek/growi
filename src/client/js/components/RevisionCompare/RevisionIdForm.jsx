import React from 'react';
import ReactSelect from 'react-select';
import PropTypes from 'prop-types';
import { format } from 'date-fns';

import { withUnstatedContainers } from '../UnstatedUtils';
import PageHistroyContainer from '../../services/PageHistoryContainer';
import RevisionCompareContainer from '../../services/RevisionCompareContainer';

import UserDate from '../User/UserDate';
import Username from '../User/Username';
import UserPicture from '../User/UserPicture';

const RevisionIdForm = (props) => {

  /**
   * create an Option array for AsyncSelect from the revision list
   */
  const revisionOptions = () => {
    const timeFormat = 'yyyy/MM/dd HH:mm:ss';
    const { revisions } = props.pageHistoryContainer.state;

    return revisions.map((rev) => {
      return { label: `${format(new Date(rev.createdAt), timeFormat)} - ${rev._id}`, value: rev._id };
    });
  }

  /**
   * render a revision selector
   * @param {label} label text of inputbox
   */
  const renderRevisionSelector = (label) => {
    if (['FromRev', 'ToRev'].indexOf(label) === -1) {
      return <></>;
    }
    const forFromRev = (label === 'FromRev');

    const { revisionCompareContainer } = props;
    const options = revisionOptions();
    const selectedRevision = (forFromRev ? revisionCompareContainer.state.fromRevision : revisionCompareContainer.state.toRevision);
    const value = options.find(it => it.value === selectedRevision?._id);
    const changeHandler = (forFromRev ? revisionCompareContainer.handleFromRevisionChange : revisionCompareContainer.handleToRevisionChange);

    const author = selectedRevision?.author;
    const pic = (typeof author === 'object') ? <UserPicture user={author} size="lg" /> : '';

    return (
      <div className="card">
        <div class="card-header">
          <ReactSelect
            options={options}
            onChange={selectedOption => changeHandler(selectedOption.value)}
            placeholder={label}
            value={value}
          />
        </div>
        <div className="card-body">
          { selectedRevision && (
          <div className="revision-history-main d-flex mt-3">
            <div className="mt-2">
              {pic}
            </div>
            <div className="ml-2">
              <div className="revision-history-author">
                <strong><Username user={author}></Username></strong>
              </div>
              <div className="revision-history-meta">
                <p>
                  <UserDate dateTime={selectedRevision.createdAt} />
                </p>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    );
  }

  const fromRevSelector = renderRevisionSelector('FromRev');
  const toRevSelector = renderRevisionSelector('ToRev');

  return (
    <div className="container-fluid px-0">
      <div className="row">
        <div className="mb-3 col-sm">
          { fromRevSelector }
        </div>
        <div className="mb-3 col-sm">
          { toRevSelector }
        </div>
      </div>
    </div>
  );

}

/**
 * Wrapper component for using unstated
 */
const RevisionIdFormWrapper = withUnstatedContainers(RevisionIdForm, [PageHistroyContainer, RevisionCompareContainer]);

/**
 * Properties
 */
RevisionIdForm.propTypes = {
  pageHistoryContainer: PropTypes.instanceOf(PageHistroyContainer).isRequired,
  revisionCompareContainer: PropTypes.instanceOf(RevisionCompareContainer).isRequired,
};

/**
 * Properties
 */
RevisionIdForm.defaultProps = {
};

export default RevisionIdFormWrapper;
