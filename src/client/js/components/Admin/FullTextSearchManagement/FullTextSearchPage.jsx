import React, { Fragment } from 'react';

class FullTextSearchManagement extends React.Component {

  constructor(props) {
    super();
  }

  Buildindex(event) {
    const axios = require('axios').create({
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      responseType: 'json',
    });
    axios.post('http://localhost:3000/_api/admin/search/build');
  }

  render() {
    return (
      <Fragment>
        <button type="submit" className="btn btn-inverse" onClick={() => { return this.Buildindex() }}>Build Now</button>
      </Fragment>
    );
  }

}

export default FullTextSearchManagement;
