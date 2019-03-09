import React from 'react';
import PropTypes from 'prop-types';

/**
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 *
 * @export
 * @class PageTagForm
 * @extends {React.Component}
 */

export default class PageTagForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      pageTags: this.props.pageTags,
    };

    this.updateState = this.updateState.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      pageTags: nextProps.pageTags,
    });
  }

  handleSubmit() {
    this.props.submitTags(this.state.pageTags);
  }

  updateState(value) {
    this.setState({ pageTags: value });
  }

  render() {
    return (
      <div className="input-group-sm mx-1">
        <input
          className="form-control page-tag-form"
          type="text"
          value={this.state.pageTags}
          placeholder="tag name"
          data-toggle="popover"
          title="タグ"
          data-content="タグ付けによりページをカテゴライズすることができます。"
          data-trigger="focus"
          data-placement="right"
          onChange={(e) => { return this.updateState(e.target.value) }}
          onBlur={this.handleSubmit}
        />
      </div>
    );
  }

}

PageTagForm.propTypes = {
  pageTags: PropTypes.string,
  submitTags: PropTypes.func,
};

PageTagForm.defaultProps = {
};
