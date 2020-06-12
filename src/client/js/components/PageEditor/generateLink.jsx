import React from 'react';
import PropTypes from 'prop-types';

import path from 'path';

export default class generateLink extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      linker: '',
    };

    this.generateLink = this.generateLink.bind(this);
  }

  generateLink() {
    const {
      link,
      label,
      type,
      isUseRelativePath,
      currentPagePath,
    } = this.props;

    let linker;
    let reshapedLink = link;

    if (isUseRelativePath && link.match(/^\//)) {
      reshapedLink = path.relative(currentPagePath, link);
    }

    if (type === 'pukiwikiLink') {
      linker = `[[${label}>${reshapedLink}]]`;
    }
    if (type === 'growiLink') {
      linker = `[${reshapedLink}]`;
    }
    if (type === 'mdLink') {
      linker = `[${label}](${reshapedLink})`;
    }

    this.setState({ linker });
  }

  render() {
    this.generateLink();

    return (
      <input type="text" readOnly className="form-control-plaintext" id="staticEmail" value={this.state.linker}></input>
    );
  }

}

generateLink.propTypes = {
  link: PropTypes.string.isRequired,
  label: PropTypes.string,
  type: PropTypes.oneOf(['pukiwikiLink', 'growiLink', 'mdLink']).isRequired,
  isUseRelativePath: PropTypes.bool,
  currentPagePath: PropTypes.string,
};
