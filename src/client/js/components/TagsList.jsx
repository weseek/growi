import React from 'react';
import PropTypes from 'prop-types';

export default class TagsList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      tagData: [],
    };
  }

  async componentWillMount() {
    const res = await this.props.crowi.apiGet('/tags.list');
    this.setState({
      tagData: res.result,
    });
  }

  render() {
    return (
      <div>
        <ul className="list-group　mx-4">
          {this.state.tagData.map((data) => {
            return (
              <a key={data.tagName} href={`/_search?q=tag:${data.tagName}`} className="list-group-item">
                <p className="float-left my-0">{data.tagName}</p>
              </a>
            );
          })}
        </ul>
      </div>
    );
  }

}

TagsList.propTypes = {
  crowi: PropTypes.object.isRequired,
};

TagsList.defaultProps = {
};
