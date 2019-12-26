import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';

class AdminHome extends React.Component {

  render() {
    const { t } = this.props;

    return (
      <Fragment>
        <p> { t('admin_top.wiki_administrator') }<br></br>
          { t('admin_top.assign_administrator') }
        </p>

        <legend>
          <h2>{ t('admin_top.System Information') }</h2>
        </legend>
        <table className="table table-bordered">
          <tr>
            <th className="col-sm-4">GROWI</th>
            {/* <td>{ growiVersion() }</td> */}
          </tr>
          <tr>
            <th>node.js</th>
            {/* <td>{ nodeVersion() }</td> */}
          </tr>
          <tr>
            <th>npm</th>
            {/* <td>{ npmVersion() }</td> */}
          </tr>
          <tr>
            <th>yarn</th>
            {/* <td>{ yarnVersion() }</td> */}
          </tr>
        </table>

        <legend>
          <h2>{ t('admin_top.List of installed plugins') }</h2>
        </legend>
        <table className="table table-bordered">
          <th className="text-center">
            { t('admin_top.Package name') }
          </th>
          <th className="text-center">
            { t('admin_top.Specified version') }
          </th>
          <th className="text-center">
            { t('admin_top.Installed version') }
          </th>
          {/* {% for pluginName in Object.keys(plugins) %}
        <tr>
          <td>{{ pluginName }}</td>
          <td class="text-center">{{ plugins[pluginName] }}</td>
          <td class="text-center"><span class="tbd">(TBD)</span></td>
        </tr>
        {% endfor %} */}
        </table>
      </Fragment>
    );
  }

}

const AdminHomeWrapper = (props) => {
  return createSubscribedElement(AdminHome, props, [AppContainer]);
};

AdminHome.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(AdminHomeWrapper);
