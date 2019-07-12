import React, { Fragment } from 'react';
import axios from 'axios';
import ReactDOM from 'react-dom';


const GEOCODE_ENDPOINT = 'https://maps.googleapis.com/maps/api/geocode/json';

class Importer extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      place: '通天閣', // ここに好きな場所を指定。

    };
  }

  handleGetLatAndLng() {
    // Google Maps APIが指定した必須パラメータ(この場合はaddress)をparamsに渡す。
    axios
      .POST("/_api/admin/settings/importerEsa", { params: { address: this.state.place } })
      .then((results) => {
        // 以下のGoogle API のレスポンスの例を元に欲しいデータを取得
        const data = results.data;
        const result = data.results[0];
        const location = result.geometry.location;
        this.setState({
          address: result.formatted_address,
          lat: location.lat,
          lng: location.lng,
        });
      })
      .catch(() => {
        console.log('通信に失敗しました。');
      });
  }

  render() {
    return (

      <div>
        <div className="app">
          <h1 className="app-title">緯度軽度検索</h1>
          <p> 土地名: {this.state.place} </p>
          <p> 経度: {this.state.lat}</p>
          <p> 経度: {this.state.lng}</p>
          <input
            type="button"
            value="経度・緯度を検索"
            onClick={() => { return this.handleGetLatAndLng() }}
          />
        </div>

        <div className="form-horizontal" method="post" className="form-horizontal" id="importerSettingFormEsa" role="form">
          <fieldset>
            <legend>
              {/* {{ t('importer_management.import_from', 'esa.io') }} */}を表示する
          </legend>
            <table className="table table-bordered table-mapping">
              <thead>
                <tr>
                  <th width="45%">esa.io</th>
                  <th width="10%"></th>
                  <th>GROWI</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>
                    {/* {{ t('Article') }} */}
                    を表示する
                </th>
                  <th><i className="icon-arrow-right-circle text-success"></i></th>
                  <th>
                    {/* {{ t('Page') }} */}
                    を表示する
                </th>
                </tr>
                <tr>
                  <th>
                    {/* {{ t('Category') }} */}
                    を表示する
                </th>
                  <th>
                    <i className="icon-arrow-right-circle text-success"></i>
                  </th>
                  <th>
                    {/* {{ t('Page Path') }} */}
                    を表示する
                </th>
                </tr>
                <tr>
                  <th>
                    {/* {{ t('User') }} */}
                    を表示する
                </th>
                  <th></th>
                  <th>(TBD)</th>
                </tr>
              </tbody>
            </table>
            <div className="well well-sm mb-0 small">
              <ul>
                <li>
                  {/* {{ t("importer_management.page_skip") }} */}
                  を表示する
              </li>
              </ul>
            </div>
            <div className="form-group">
              <input type="password" name="dummypass" style="display:none; top: -100px; left: -100px;" />
            </div>

            <div class="form-group">
              <label for="settingForm[importer:esa:team_name]" class="col-xs-3 control-label">{{ t('importer_management.esa_settings.team_name') }}</label>
              <div class="col-xs-6">
                <input class="form-control" type="text" name="settingForm[importer:esa:team_name]" value="{{ settingForm['importer:esa:team_name'] | default('') }}">
            </div>
              </div>

          </fieldset>
        </div>

        </div>
        );
      }

    }

    export default Importer;

{ /* <div>
        <div className="app">
          <h1 className="app-title">緯度軽度検索</h1>
          <p> 土地名: {this.state.place} </p>
          <p> 経度: {this.state.lat}</p>
          <p> 経度: {this.state.lng}</p>
          <input
            type="button"
            value="経度・緯度を検索"
            onClick={() => { return this.handleGetLatAndLng() }}
          />
        </div> */ }
