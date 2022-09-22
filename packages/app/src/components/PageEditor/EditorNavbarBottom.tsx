import React, { useCallback, useState, useEffect } from 'react';

import PropTypes from 'prop-types';
import { Collapse, Button } from 'reactstrap';


import AppContainer from '~/client/services/AppContainer';
import EditorContainer from '~/client/services/EditorContainer';
import { useCurrentPagePath } from '~/stores/context';
import { useSWRxSlackChannels, useIsSlackEnabled } from '~/stores/editor';
import {
  EditorMode, useDrawerOpened, useEditorMode, useIsDeviceSmallerThanMd,
} from '~/stores/ui';

import SavePageControls from '../SavePageControls';
import SlackLogo from '../SlackLogo';
import { SlackNotification } from '../SlackNotification';
import { withUnstatedContainers } from '../UnstatedUtils';


import OptionsSelector from './OptionsSelector';

const EditorNavbarBottom = (props) => {

  const { data: editorMode } = useEditorMode();

  const [isExpanded, setExpanded] = useState(false);

  const [isSlackExpanded, setSlackExpanded] = useState(false);
  const isSlackConfigured = props.appContainer.getConfig().isSlackConfigured;

  const { mutate: mutateDrawerOpened } = useDrawerOpened();
  const { data: isDeviceSmallerThanMd } = useIsDeviceSmallerThanMd();
  const additionalClasses = ['grw-editor-navbar-bottom'];
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: slackChannelsData } = useSWRxSlackChannels(currentPagePath);
  const { data: isSlackEnabled, mutate: mutateIsSlackEnabled } = useIsSlackEnabled();

  const [slackChannelsStr, setSlackChannelsStr] = useState<string>('');

  useEffect(() => {
    if (slackChannelsData != null) {
      setSlackChannelsStr(slackChannelsData.toString());
      mutateIsSlackEnabled(false);
    }
  }, [mutateIsSlackEnabled, slackChannelsData]);

  const isSlackEnabledToggleHandler = (bool: boolean) => {
    mutateIsSlackEnabled(bool, false);
  };

  const slackChannelsChangedHandler = useCallback((slackChannels: string) => {
    setSlackChannelsStr(slackChannels);
  }, []);


  const renderDrawerButton = () => (
    <button
      type="button"
      className="btn btn-outline-secondary border-0"
      onClick={() => mutateDrawerOpened(true)}
    >
      <i className="icon-menu"></i>
    </button>
  );

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

  const isOptionsSelectorEnabled = editorMode !== EditorMode.HackMD;
  const isCollapsedOptionsSelectorEnabled = isOptionsSelectorEnabled && isDeviceSmallerThanMd;

  return (
    <div className={`${isCollapsedOptionsSelectorEnabled ? 'fixed-bottom' : ''} `}>
      {/* Collapsed SlackNotification */}
      {isSlackConfigured && (
        <Collapse isOpen={isSlackExpanded && isDeviceSmallerThanMd === true}>
          <nav className={`navbar navbar-expand-lg border-top ${additionalClasses.join(' ')}`}>
            {isSlackEnabled != null
            && (
              <SlackNotification
                isSlackEnabled={isSlackEnabled}
                slackChannels={slackChannelsStr}
                onEnabledFlagChange={isSlackEnabledToggleHandler}
                onChannelChange={slackChannelsChangedHandler}
                id="idForEditorNavbarBottomForMobile"
              />
            )
            }
          </nav>
        </Collapse>
      )
      }
      <div className={`navbar navbar-expand border-top px-2 px-md-3 ${additionalClasses.join(' ')}`}>
        <form className="form-inline">
          { isDeviceSmallerThanMd && renderDrawerButton() }
          { isOptionsSelectorEnabled && !isDeviceSmallerThanMd && <OptionsSelector /> }
        </form>
        <form className="form-inline flex-nowrap ml-auto">
          {/* Responsive Design for the SlackNotification */}
          {/* Button or the normal Slack banner */}
          {isSlackConfigured && (isDeviceSmallerThanMd ? (
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
              {isSlackEnabled != null
              && (
                <SlackNotification
                  isSlackEnabled={isSlackEnabled}
                  slackChannels={slackChannelsStr}
                  onEnabledFlagChange={isSlackEnabledToggleHandler}
                  onChannelChange={slackChannelsChangedHandler}
                  id="idForEditorNavbarBottom"
                />
              )}
            </div>
          ))}
          <SavePageControls slackChannels={slackChannelsStr} isSlackEnabled={isSlackEnabled || false} />
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
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  editorContainer: PropTypes.instanceOf(EditorContainer).isRequired,
};

export default withUnstatedContainers(EditorNavbarBottom, [EditorContainer, AppContainer]);
