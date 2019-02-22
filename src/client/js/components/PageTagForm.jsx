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
      pageTags: nextProps.pageTags
    });
  }

  handleSubmit(e) {
    this.props.submitTags(this.state.pageTags);
    e.preventDefault();
  }

  updateState(value) {
    this.setState({pageTags: value});
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label className="mr-2">Tag:</label>
        <input className="form-control" type="text" value={this.state.pageTags} placeholder="input tag name"
          data-toggle="popover"
          title="タグ"
          data-content="タグ付けによりページをカテゴライズすることができます。"
          data-trigger="focus"
          data-placement="top"
          onChange={e => this.updateState(e.target.value)}
          />
      </form>
    );
  }
}

PageTagForm.propTypes = {
  crowi: PropTypes.object.isRequired,
  pageId: PropTypes.string,
  pagePath: PropTypes.string,
  pageTags: PropTypes.string,
  submitTags: PropTypes.func,
};

PageTagForm.defaultProps = {
};
