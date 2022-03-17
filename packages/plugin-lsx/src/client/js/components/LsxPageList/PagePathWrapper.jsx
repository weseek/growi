import React from 'react';
import PropTypes from 'prop-types';

import { PagePathLabel } from '@growi/ui';

export class PagePathWrapper extends React.Component {

  render() {

    const classNames = [];
    if (!this.props.isExists) {
      classNames.push('lsx-page-not-exist');
    }

    return (
      <PagePathLabel path={this.props.pagePath} isLatterOnly additionalClassNames={classNames} />
    );
  }

}

PagePathWrapper.propTypes = {
  pagePath: PropTypes.string.isRequired,
  isExists: PropTypes.bool.isRequired,
  excludePathString: PropTypes.string,
};

PagePathWrapper.defaultProps = {
  excludePathString: '',
};
