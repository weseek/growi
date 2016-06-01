import React from 'react';

export default class PageBody extends React.Component {
  render() {
    let body = this.props.pageBody;
    if (body === '') {
      body = this.props.page.revision.body;
    }

    return (
      <div>
        {body}
      </div>
    );
  }
}

PageBody.propTypes = {
  page: React.PropTypes.object.isRequired,
  pageBody: React.PropTypes.string,
};

PageBody.defaultProps = {
  page: {},
  pageBody: '',
};

