import React from 'react';
import PropTypes from 'prop-types';

export default class SearchResultInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isChecked: false,
    }
    this.toggleCheckboxChange = this.toggleCheckboxChange.bind(this);
  }

  toggleCheckboxChange() {
    const { handleCheckboxChange, page } = this.props;

    this.setState(({ isChecked }) => (
      {
        isChecked: !isChecked,
      }
    ));

    this.props.handleCheckboxChange(page);
  }

  render() {
    let deletionMode = this.props.deletionMode;
    let pageId = this.props.page.id;
    const { isChecked } = this.state;

    const checkBoxInput = deletionMode ? (
      <input
        type="checkbox"
        value={pageId}
        checked={isChecked}
        onChange={this.toggleCheckboxChange} />
    ) : null;
    return (
      <div>
        {checkBoxInput}
      </div>
    );
  }
}

SearchResultInput.propTypes = {
  page: PropTypes.object.isRequired,
  deletionMode: PropTypes.bool.isRequired,
  handleCheckboxChange: PropTypes.func.isRequired,
};
