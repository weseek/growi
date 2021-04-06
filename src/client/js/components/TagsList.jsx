import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import PaginationWrapper from './PaginationWrapper';

class TagsList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      tagData: [],
      activePage: 1,
      totalTags: 0,
      pagingLimit: 10,
    };

    this.handlePage = this.handlePage.bind(this);
    this.getTagList = this.getTagList.bind(this);
  }

  async componentWillMount() {
    await this.getTagList(1);
  }

  async handlePage(selectedPage) {
    await this.getTagList(selectedPage);
  }

  async getTagList(selectPageNumber) {
    const limit = this.state.pagingLimit;
    const offset = (selectPageNumber - 1) * limit;
    const res = await this.props.crowi.apiGet('/tags.list', { limit, offset });

    const totalTags = res.totalCount;
    const tagData = res.data;
    const activePage = selectPageNumber;

    this.setState({
      tagData,
      activePage,
      totalTags,
    });
  }

  /**
   * generate Elements of Tag
   *
   * @param {any} pages Array of pages Model Obj
   *
   */
  generateTagList(tagData) {
    return tagData.map((data) => {
      return (
        <a key={data.name} href={`/_search?q=tag:${data.name}`} className="list-group-item">
          <i className="icon-tag mr-2"></i>{data.name}
          <span className="ml-4 list-tag-count badge badge-secondary text-muted">{data.count}</span>
        </a>
      );
    });
  }

  render() {
    const { t } = this.props;
    const messageForNoTag = this.state.tagData.length ? null : <h3>{ t('You have no tag, You can set tags on pages') }</h3>;

    return (
      <div className="text-center">
        <div className="tag-list">
          <ul className="list-group text-left">
            {this.generateTagList(this.state.tagData)}
          </ul>
          {messageForNoTag}
        </div>
        <div className="tag-list-pagination">
          <PaginationWrapper
            activePage={this.state.activePage}
            changePage={this.handlePage}
            totalItemsCount={this.state.totalTags}
            pagingLimit={this.state.pagingLimit}
            size="sm"
          />
        </div>
      </div>
    );
  }

}

TagsList.propTypes = {
  crowi: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired, // i18next
};

TagsList.defaultProps = {
};

export default withTranslation()(TagsList);
