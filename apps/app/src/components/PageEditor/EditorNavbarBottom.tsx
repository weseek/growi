import React, { useCallback, useState, useEffect } from 'react';

import dynamic from 'next/dynamic';
import { Collapse, Button } from 'reactstrap';


import { SavePageControlsProps } from '~/components/SavePageControls';
import { useIsSlackConfigured } from '~/stores/context';
import { useSWRxSlackChannels, useIsSlackEnabled } from '~/stores/editor';
import { useCurrentPagePath } from '~/stores/page';
import {
  useDrawerOpened, useEditorMode, useIsDeviceSmallerThanMd,
} from '~/stores/ui';


import styles from './EditorNavbarBottom.module.scss';

const moduleClass = styles['grw-editor-navbar-bottom'];


const SavePageControls = dynamic<SavePageControlsProps>(() => import('~/components/SavePageControls').then(mod => mod.SavePageControls), { ssr: false });
const SlackLogo = dynamic(() => import('~/components/SlackLogo').then(mod => mod.SlackLogo), { ssr: false });
const SlackNotification = dynamic(() => import('~/components/SlackNotification').then(mod => mod.SlackNotification), { ssr: false });
const OptionsSelector = dynamic(() => import('~/components/PageEditor/OptionsSelector').then(mod => mod.OptionsSelector), { ssr: false });


const EditorNavbarBottom = (): JSX.Element => {

  const [isExpanded, setExpanded] = useState(false);
  const [isSlackExpanded, setSlackExpanded] = useState(false);

  const { data: editorMode } = useEditorMode();
  const { data: isSlackConfigured } = useIsSlackConfigured();
  const { mutate: mutateDrawerOpened } = useDrawerOpened();
  const { data: isDeviceSmallerThanMd } = useIsDeviceSmallerThanMd();
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: slackChannelsData } = useSWRxSlackChannels(currentPagePath);

  const { data: isSlackEnabled, mutate: mutateIsSlackEnabled } = useIsSlackEnabled();

  const [slackChannelsStr, setSlackChannelsStr] = useState<string>('');

  // DO NOT dependent on slackChannelsData directly: https://github.com/weseek/growi/pull/7332
  const slackChannelsDataString = slackChannelsData?.toString();
  useEffect(() => {
    if (editorMode === 'editor') {
      setSlackChannelsStr(slackChannelsDataString ?? '');
      mutateIsSlackEnabled(false);
    }
  }, [editorMode, mutateIsSlackEnabled, slackChannelsDataString]);

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
    <div className="d-md-none ms-2">
      <button
        type="button"
        className={`btn btn-outline-secondary btn-expand border-0 ${isExpanded ? 'expand' : ''}`}
        onClick={() => setExpanded(!isExpanded)}
      >
        <i className="icon-arrow-up"></i>
      </button>
    </div>
  );

  const isCollapsedOptionsSelectorEnabled = isDeviceSmallerThanMd;

  return (
    <div className={`${isCollapsedOptionsSelectorEnabled ? 'fixed-bottom' : ''} `}>
      {/* Collapsed SlackNotification */}
      {isSlackConfigured && (
        <Collapse isOpen={isSlackExpanded && isDeviceSmallerThanMd === true}>
          <nav className={`navbar navbar-expand-lg border-top ${moduleClass}`}>
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
      <div className={`flex-expand-horiz align-items-center border-top px-2 px-md-3 ${moduleClass}`}>
        <form>
          { isDeviceSmallerThanMd && renderDrawerButton() }
          { !isDeviceSmallerThanMd && <OptionsSelector /> }
        </form>
        <form className="flex-nowrap ms-auto">
          {/* Responsive Design for the SlackNotification */}
          {/* Button or the normal Slack banner */}
          {isSlackConfigured && (isDeviceSmallerThanMd ? (
            <Button
              className="grw-btn-slack border me-2"
              onClick={() => (setSlackExpanded(!isSlackExpanded))}
            >
              <div className="grw-slack-logo">
                <SlackLogo />
                <span className="grw-btn-slack-triangle fa fa-caret-up ms-2"></span>
              </div>
            </Button>
          ) : (
            <div className="me-2">
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
          <SavePageControls slackChannels={slackChannelsStr} />
          { isCollapsedOptionsSelectorEnabled && renderExpandButton() }
        </form>
      </div>
      {/* Collapsed OptionsSelector */}
      { isCollapsedOptionsSelectorEnabled && (
        <Collapse isOpen={isExpanded}>
          <div className="px-2"> {/* set padding for border-top */}
            <div className={`navbar navbar-expand border-top px-0 ${moduleClass}`}>
              <form className="ms-auto">
                <OptionsSelector />
              </form>
            </div>
          </div>
        </Collapse>
      ) }
    </div>
  );
};

export default EditorNavbarBottom;
