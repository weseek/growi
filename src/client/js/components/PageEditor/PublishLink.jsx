import React from 'react';
import PropTypes from 'prop-types';

export default class PublishLink extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      linker: '',
    };

    this.generateLink = this.generateLink.bind(this);
  }

  generateLink() {
    const { link, label, type } = this.props;
    let linker;
    if (type === 'pukiwikiLink') {
      linker = `[[${label}>${link}]]`;
    }
    if (type === 'growiLink') {
      linker = `[${link}]`;
    }
    if (type === 'MDLink') {
      linker = `[${label}](${link})`;
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

PublishLink.propTypes = {
  link: PropTypes.string.isRequired,
  label: PropTypes.string,
  type: PropTypes.oneOf(['pukiwikiLink', 'growiLink', 'MDLink']).isRequired,
  isUseRelativePath: PropTypes.bool,
};
