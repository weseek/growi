import React from 'react';
import PropTypes from 'prop-types';
import NavigationContainer from '../../services/NavigationContainer';
import { withUnstatedContainers } from '../UnstatedUtils';
import Editor from '../PageEditor';
import EditorNavbarBottom from '../PageEditor/EditorNavbarBottom';

const NotFoundAlert = (props) => {
  const { navigationContainer } = props;
  const { editorMode } = navigationContainer.state;

  function clickHandler() {
    navigationContainer.setEditorMode('edit');
  }

  function renderNotFound() {
    if (editorMode === 'view') {
      return (
        <div className="grw-not-found-alert border m-4 p-4">
          <div className="col-md-12">
            <h2 className="text-muted not-found-text">
              <i className="icon-info" aria-hidden="true"></i>
              {/* Todo make the message supported by i18n GW4050 */ }
              このページは存在しません。新たに作成する必要があります。
            </h2>
            <button
              type="button"
              className="m-2 p-2"
              onClick={clickHandler}
            >
              <i className="icon-note icon-fw" />
              {/* Todo make the message supported by i18n GW4050 */ }
              ページを作成する
            </button>
          </div>
        </div>
      );
    }
    return (
      <div id="page-editor">
        <Editor />
        <EditorNavbarBottom />
      </div>
    );

  }


  return (
    <div>
      { renderNotFound() }
    </div>
  );
};


/**
 * Wrapper component for using unstated
 */
const NotFoundAlertWrapper = withUnstatedContainers(NotFoundAlert, [NavigationContainer]);


NotFoundAlert.propTypes = {
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
};


export default NotFoundAlertWrapper;
