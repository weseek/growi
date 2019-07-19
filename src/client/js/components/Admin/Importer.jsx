import React, { Fragment } from 'react';
import axios from 'axios';
import ReactDOM from 'react-dom';

const axiosClient = axios.create({
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

class Importer extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      esa_team_name: '',
      esa_accessToken: '',
      qiitaTeamName: '',
      qiitaAccessToken: '',
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputValue = this.handleInputValue.bind(this);
  }


  handleInputValue(event) {
    this.setState({
      [event.target.name]: event.target.value,
    });
  }


  handleSubmit() {
    axios({
      method: 'POST',
      url: '/_api/admin/import/esa',
      data: { team_name: this.state.esa_team_name, accessToken: this.state.esa_accessToken },
    })
      .then((response) => {
        console.log(this.props);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  render() {
    const { team_name, accessToken } = this.state;
    return (
      <Fragment>
        <form
          action="/_api/admin/settings/importerEsa"
          className="form-horizontal"
          id="importerSettingFormEsa"
          role="form"
          data-success-messaage="{{ ('Updated') }}"
        >

          <div className="form-group">
            <input type="password" name="dummypass" style={{ display: 'none', top: '-100px', left: '-100px' }} />
          </div>

          <div className="form-group">
            <label>esaTeamName : </label>
            <input type="text" name="esa_team_name" value={esa_team_name} onChange={this.handleInputValue} />
          </div>

          <div className="form-group">
            <label>esaAccessToken : </label>
            <input type="password" name="esa_accessToken" value={esa_accessToken} onChange={this.handleInputValue} />
          </div>

          <input type="button" onClick={this.handleSubmit} value="Submit" />

        </form>

      </Fragment>

    );
  }

}

export default Importer;
