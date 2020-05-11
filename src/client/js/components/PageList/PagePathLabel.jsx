import React from 'react';
import PropTypes from 'prop-types';

import PagePath from '../../models/PagePath';

const PagePathLabel = (props) => {

  const pagePath = new PagePath(props.page.path, false, true);

  let classNames = ['page-path'];
  classNames = classNames.concat(props.additionalClassNames);

  if (props.isLatterOnly) {
    return <span className={classNames.join(' ')}>{pagePath.latter}</span>;
  }

  const textElem = (pagePath.former == null && pagePath.latter == null)
    ? <><strong>/</strong></>
    : <>{pagePath.former}/<strong>{pagePath.latter}</strong></>;

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
