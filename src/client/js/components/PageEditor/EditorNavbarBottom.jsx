import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Collapse, Button } from 'reactstrap';

import NavigationContainer from '../../services/NavigationContainer';
import EditorContainer from '../../services/EditorContainer';
import AppContainer from '../../services/AppContainer';
import SlackNotification from '../SlackNotification';
import SlackLogo from '../SlackLogo';
import { withUnstatedContainers } from '../UnstatedUtils';

import SavePageControls from '../SavePageControls';

import OptionsSelector from './OptionsSelector';

const EditorNavbarBottom = (props) => {

  const [isExpanded, setExpanded] = useState(false);

  const [isSlackExpanded, setSlackExpanded] = useState(false);
  const hasSlackConfig = props.appContainer.getConfig().hasSlackConfig;

  const {
    navigationContainer,
  } = props;
  const { editorMode, isDrawerMode, isDeviceSmallerThanMd } = navigationContainer.state;

  const additionalClasses = ['grw-editor-navbar-bottom'];

  const renderDrawerButton = () => (
    <button type="button" className="btn btn-outline-secondary border-0" onClick={() => navigationContainer.toggleDrawer()}>
      <i className="icon-menu"></i>
    </button>
  );

  const slackEnabledFlagChangedHandler = (isSlackEnabled) => {
    props.editorContainer.setState({ isSlackEnabled });
  };

  const slackChannelsChangedHandler = (slackChannels) => {
    props.editorContainer.setState({ slackChannels });
  };

  // eslint-disable-next-line react/prop-types
  const renderExpandButton = () => (
    <div className="d-md-none ml-2">
      <button
        type="button"
        className={`btn btn-outline-secondary btn-expand border-0 ${isExpanded ? 'expand' : ''}`}
        onClick={() => setExpanded(!isExpanded)}
      >
        <i className="icon-arrow-up"></i>
      </button>
    </div>
  );

  const isOptionsSelectorEnabled = editorMode !== 'hackmd';
  const isCollapsedOptionsSelectorEnabled = isOptionsSelectorEnabled && isDeviceSmallerThanMd;

  return (
    <div className={`${isCollapsedOptionsSelectorEnabled ? 'fixed-bottom' : ''} `}>
      {/* Collapsed SlackNotification */}
      {hasSlackConfig && (
        <Collapse isOpen={isSlackExpanded && isDeviceSmallerThanMd}>
          <nav className={`navbar navbar-expand-lg border-top ${additionalClasses.join(' ')}`}>
            <SlackNotification
              isSlackEnabled={props.editorContainer.state.isSlackEnabled}
              slackChannels={props.editorContainer.state.slackChannels}
              onEnabledFlagChange={slackEnabledFlagChangedHandler}
              onChannelChange={slackChannelsChangedHandler}
              id="idForEditorNavbarBottomForMobile"
              popUp
            />
          </nav>
        </Collapse>
        )
      }
      <div className={`navbar navbar-expand border-top px-2 ${additionalClasses.join(' ')}`}>
        <form className="form-inline">
          { isDrawerMode && renderDrawerButton() }
          { isOptionsSelectorEnabled && !isDeviceSmallerThanMd && <OptionsSelector /> }
        </form>
        <form className="form-inline ml-auto">
          {/* Responsive Design for the SlackNotification */}
          {/* Button or the normal Slack banner */}
          {hasSlackConfig && (isDeviceSmallerThanMd ? (
            <Button
              className="grw-btn-slack border mr-2"
              onClick={() => (setSlackExpanded(!isSlackExpanded))}
            >
              <div className="grw-slack-logo">
                <SlackLogo />
                <span className="grw-btn-slack-triangle fa fa-caret-up ml-2"></span>
              </div>
            </Button>
          ) : (
            <div className="mr-2">
              <SlackNotification
                isSlackEnabled={props.editorContainer.state.isSlackEnabled}
                slackChannels={props.editorContainer.state.slackChannels}
                onEnabledFlagChange={slackEnabledFlagChangedHandler}
                onChannelChange={slackChannelsChangedHandler}
                id="idForEditorNavbarBottom"
                popUp={false}
              />
            </div>
          ))}
          <SavePageControls />
          { isCollapsedOptionsSelectorEnabled && renderExpandButton() }
        </form>
      </div>
      {/* Collapsed OptionsSelector */}
      { isCollapsedOptionsSelectorEnabled && (
        <Collapse isOpen={isExpanded}>
          <div className="px-2"> {/* set padding for border-top */}
            <div className={`navbar navbar-expand border-top px-0 ${additionalClasses.join(' ')}`}>
              <form className="form-inline ml-auto">
                <OptionsSelector />
              </form>
            </div>
          </div>
        </Collapse>
      ) }
    </div>
  );
};

EditorNavbarBottom.propTypes = {
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  editorContainer: PropTypes.instanceOf(EditorContainer).isRequired,
};

export default withUnstatedContainers(EditorNavbarBottom, [NavigationContainer, EditorContainer, AppContainer]);
