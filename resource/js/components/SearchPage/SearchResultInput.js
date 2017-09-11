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

  /**
   * checkbox の選択切り替えを行い、
   * 親コンポーネントに定義されたメソッドを呼び出します
   *
   * @memberof SearchResultInput
   */
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
    let pageId = this.props.page.id;
    const { isChecked } = this.state;

    return (
      <input
        type="checkbox"
        value={pageId}
        checked={isChecked}
        onChange={this.toggleCheckboxChange} />
    );
  }
}

SearchResultInput.propTypes = {
  page: PropTypes.object.isRequired,
  handleCheckboxChange: PropTypes.func.isRequired,
};
