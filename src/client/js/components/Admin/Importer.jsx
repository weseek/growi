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
      esaTeamName: '',
      esaAccessToken: '',
      qiitaTeamName: '',
      qiitaAccessToken: '',
    };
    this.esaHandleSubmit = this.esaHandleSubmit.bind(this);
    this.esaHandleSubmitTest = this.esaHandleSubmitTest.bind(this);
    this.handleInputValue = this.handleInputValue.bind(this);
  }


  handleInputValue(event) {
    this.setState({
      [event.target.name]: event.target.value,
    });
  }


  esaHandleSubmit() {
    axios({
      method: 'POST',
      url: '/_api/admin/import/esa',
      data: { esaTeamName: this.state.esaTeamName, esaAccessToken: this.state.esaAccessToken },
    })
      .then((response) => {
        console.log(this.props);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  esaHandleSubmitTest() {
    axios({
      method: 'POST',
      url: '/_api/admin/import/testEsaAPI',
      data: { esaTeamName: this.state.esaTeamName, esaAccessToken: this.state.esaAccessToken },
    })
      .then((response) => {
        console.log(this.props);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  render() {
    const { esaTeamName, esaAccessToken } = this.state;
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
            <input type="text" name="esaTeamName" value={esaTeamName} onChange={this.handleInputValue} />
          </div>

          <div className="form-group">
            <label>esaAccessToken : </label>
            <input type="password" name="esaAccessToken" value={esaAccessToken} onChange={this.handleInputValue} />
          </div>

          <input type="button" onClick={this.esaHandleSubmit} value="インポート" />

          <input type="button" onClick={this.esaHandleSubmitTest} value="接続テスト" />


        </form>

      </Fragment>

    );
  }

}

export default Importer;
