import React from 'react';
import PropTypes from 'prop-types';

import PagePathModel from '../../models/PagePath';

const PagePathLabel = (props) => {

  const model = new PagePathModel(props.page.path, true);

  let classNames = ['page-path'];
  classNames = classNames.concat(props.additionalClassNames);

  if (props.isLatterOnly) {
    return <span className={classNames.join(' ')}>{model.latter}</span>;
  }

  const textElem = (model.former == null && model.latter == null)
    ? <><strong>/</strong></>
    : <>{model.former}/<strong>{model.latter}</strong></>;

  return <span className={classNames.join(' ')}>{textElem}</span>;
};

PagePathLabel.propTypes = {
  page: PropTypes.object.isRequired,
  isLatterOnly: PropTypes.bool,
  additionalClassNames: PropTypes.array,
};

PagePathLabel.defaultProps = {
  additionalClassNames: [],
};

export default PagePathLabel;
