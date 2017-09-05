import React from 'react';
import PropTypes from 'prop-types';

export default class SearchResultInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isChecked: false,
    }
  }

  toggleCheckboxChange() {
    const { handleCheckboxChange, selectablePage } = this.props;

    this.setState(({ isChecked }) => (
      {
        isChecked: !isChecked,
      }
    ));

    handleCheckboxChange(selectablePage);
  }

  render() {
    let deletionMode = this.props.deletionMode;
    let pageId = this.props.selectablePage.id;
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
  selectablePage: PropTypes.object.isRequired,
  deletionMode: PropTypes.bool.isRequired,
  handleCheckboxChange: PropTypes.func.isRequired,
};
