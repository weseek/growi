import React from 'react';

export default class PageBody extends React.Component {

  constructor(props) {
    super(props);

    this.crowiRenderer = window.crowiRenderer; // FIXME
    this.getMarkupHTML = this.getMarkupHTML.bind(this);
  }

  getMarkupHTML() {
    let body = this.props.pageBody;
    if (body === '') {
      body = this.props.page.revision.body;
    }

    return { __html: this.crowiRenderer.render(body) };
  }

  render() {
    const parsedBody = this.getMarkupHTML();

    return (
      <div
        className="content"
        dangerouslySetInnerHTML={parsedBody}
        />
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

