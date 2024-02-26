import React, { useCallback, useState, useEffect } from 'react';

import dynamic from 'next/dynamic';
import { Collapse, Button } from 'reactstrap';


import type { SavePageControlsProps } from '~/components/SavePageControls';
import { useIsSlackConfigured } from '~/stores/context';
import { useSWRxSlackChannels, useIsSlackEnabled } from '~/stores/editor';
import { useCurrentPagePath } from '~/stores/page';
import {
  useEditorMode, useIsDeviceLargerThanLg, useIsDeviceLargerThanMd,
} from '~/stores/ui';


import styles from './EditorNavbarBottom.module.scss';

const moduleClass = styles['grw-editor-navbar-bottom'];


const SavePageControls = dynamic<SavePageControlsProps>(() => import('~/components/SavePageControls').then(mod => mod.SavePageControls), { ssr: false });
const SlackLogo = dynamic(() => import('~/components/SlackLogo').then(mod => mod.SlackLogo), { ssr: false });
const SlackNotification = dynamic(() => import('~/components/SlackNotification').then(mod => mod.SlackNotification), { ssr: false });
const OptionsSelector = dynamic(() => import('~/components/PageEditor/OptionsSelector').then(mod => mod.OptionsSelector), { ssr: false });


const EditorNavbarBottom = (): JSX.Element => {

  const [isSlackExpanded, setSlackExpanded] = useState(false);

  const { data: editorMode } = useEditorMode();
  const { data: isSlackConfigured } = useIsSlackConfigured();
  const { data: isDeviceLargerThanMd } = useIsDeviceLargerThanMd();
  const { data: isDeviceLargerThanLg } = useIsDeviceLargerThanLg();
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

  return (
    <div data-testid="grw-editor-navbar-bottom">
      {/* Collapsed SlackNotification */}
      {isSlackConfigured && (
        <Collapse isOpen={isSlackExpanded && !isDeviceLargerThanLg}>
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
      <div className={`flex-expand-horiz align-items-center px-2 px-md-3 ${moduleClass}`}>
        <form>
          <OptionsSelector collapsed={!isDeviceLargerThanMd} />
        </form>
        <form className="row row-cols-lg-auto g-3 align-items-center ms-auto">
          {/* Responsive Design for the SlackNotification */}
          {/* Button or the normal Slack banner */}
          {isSlackConfigured && (!isDeviceLargerThanMd ? (
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
        </form>
      </div>
    </div>
  );
};

export default EditorNavbarBottom;
