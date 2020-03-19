import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import Avatar from '@atlaskit/avatar';
import AddIcon from '@atlaskit/icon/glyph/add';
import BacklogIcon from '@atlaskit/icon/glyph/backlog';
import BoardIcon from '@atlaskit/icon/glyph/board';
import DashboardIcon from '@atlaskit/icon/glyph/dashboard';
import FolderIcon from '@atlaskit/icon/glyph/folder';
import GraphLineIcon from '@atlaskit/icon/glyph/graph-line';
import IssuesIcon from '@atlaskit/icon/glyph/issues';
import ShortcutIcon from '@atlaskit/icon/glyph/shortcut';
import QuestionCircleIcon from '@atlaskit/icon/glyph/question-circle';
import SearchIcon from '@atlaskit/icon/glyph/search';
import { JiraIcon, JiraWordmark } from '@atlaskit/logo';
import { ToggleStateless } from '@atlaskit/toggle';
import { gridSize as gridSizeFn } from '@atlaskit/theme';
import InlineDialog from '@atlaskit/inline-dialog';

import {
  ContainerHeader,
  GlobalNav,
  GroupHeading,
  HeaderSection,
  Item as ItemComponent,
  ItemAvatar,
  LayoutManager,
  MenuSection,
  NavigationProvider,
  Separator,
  Wordmark,
} from '@atlaskit/navigation-next';

import { createSubscribedElement } from './UnstatedUtils';
import AppContainer from '../services/AppContainer';


const gridSize = gridSizeFn();

const Item = ({ testKey, ...props }) => {
  const item = <ItemComponent {...props} />;
  return testKey ? <div data-webdriver-test-key={testKey}>{item}</div> : item;
};

/**
 * Global navigation
 */
const globalNavPrimaryItems = [
  {
    id: 'jira',
    icon: () => <JiraIcon size="medium" label="Jira" />,
    label: 'Jira',
  },
  { id: 'search', icon: SearchIcon, label: 'Search' },
  { id: 'create', icon: AddIcon, label: 'Add' },
];

const globalNavSecondaryItems = [
  {
    id: '10-composed-navigation',
    icon: QuestionCircleIcon,
    label: 'Help',
    size: 'small',
  },
  {
    id: '10-composed-navigation-2',
    icon: () => (
      <Avatar
        borderColor="transparent"
        isActive={false}
        isHover={false}
        size="small"
      />
    ),
    label: 'Profile',
    size: 'small',
  },
];

const GlobalNavigation = () => (
  <div data-webdriver-test-key="global-navigation">
    <GlobalNav
      primaryItems={globalNavPrimaryItems}
      secondaryItems={globalNavSecondaryItems}
    />
  </div>
);

const TestMark = ({ id, children }) => (
  <div data-webdriver-test-key={id}>{children}</div>
);

/**
 * Content navigation
 */
const ProductNavigation = () => (
  <div data-webdriver-test-key="product-navigation">
    <HeaderSection>
      {({ className }) => (
        <div className={className}>
          <TestMark id="product-header">
            <Wordmark wordmark={JiraWordmark} />
          </TestMark>
        </div>
      )}
    </HeaderSection>
    <MenuSection>
      {({ className }) => (
        <div className={className}>
          <Item
            before={DashboardIcon}
            text="Dashboards"
            testKey="product-item-dashboards"
          />
          <Item
            before={FolderIcon}
            text="Projects"
            testKey="product-item-projects"
          />
          <Item
            before={IssuesIcon}
            text="Issues"
            testKey="product-item-issues"
          />
        </div>
      )}
    </MenuSection>
  </div>
);

class Sidebar extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      shouldDisplayContainerNav: true,
      dialogOpen: false,
    };

    this.toggleContainerNav = this.toggleContainerNav.bind(this);
    this.renderContainerNavigation = this.renderContainerNavigation.bind(this);
  }

  toggleContainerNav() {
    this.setState(state => ({
      shouldDisplayContainerNav: !state.shouldDisplayContainerNav,
    }));
  }

  renderContainerNavigation() {
    return (
      <div data-webdriver-test-key="container-navigation">
        <HeaderSection>
          {({ css }) => (
            <div
              data-webdriver-test-key="container-header"
              css={{
                ...css,
                paddingBottom: gridSize * 2.5,
              }}
            >
              <ContainerHeader
                before={itemState => (
                  <ItemAvatar
                    itemState={itemState}
                    appearance="square"
                    size="large"
                  />
                )}
                text="My software project"
                subText="Software project"
              />
            </div>
          )}
        </HeaderSection>
        <MenuSection>
          {({ className }) => (
            <div className={className}>
              <Item
                before={BacklogIcon}
                text="Backlog"
                isSelected
                testKey="container-item-backlog"
              />
              <Item
                before={BoardIcon}
                text="Active sprints"
                testKey="container-item-sprints"
              />
              <Item
                before={GraphLineIcon}
                text="Reports"
                testKey="container-item-reports"
              />
              <Separator />
              <GroupHeading>Shortcuts</GroupHeading>
              <Item before={ShortcutIcon} text="Project space" />
              <Item before={ShortcutIcon} text="Project repo" />
              <InlineDialog
                onClose={() => {
                  this.setState({ dialogOpen: false });
                }}
                content={<div>Renders correctly without getting chopped off</div>}
                isOpen={this.state.dialogOpen}
                placement="right"
              >
                <Item
                  onClick={() => {
                    this.setState({ dialogOpen: true });
                  }}
                  before={GraphLineIcon}
                  text="Item with InlineDialog"
                  testKey="container-item-click"
                />
              </InlineDialog>
            </div>
          )}
        </MenuSection>
      </div>
    );
  }

  render() {
    const { shouldDisplayContainerNav } = this.state;
    return (
      <NavigationProvider>
        <LayoutManager
          globalNavigation={GlobalNavigation}
          productNavigation={ProductNavigation}
          containerNavigation={
            shouldDisplayContainerNav ? this.renderContainerNavigation : null
          }
        >
          <div
            data-webdriver-test-key="content"
            style={{ padding: `${gridSize * 4}px ${gridSize * 5}px` }}
          >
            <ToggleStateless
              isChecked={shouldDisplayContainerNav}
              onChange={this.toggleContainerNav}
            />{' '}
            Display container navigation layer
          </div>
        </LayoutManager>
      </NavigationProvider>
    );
  }

}


/**
 * Wrapper component for using unstated
 */
const SidebarWrapper = (props) => {
  return createSubscribedElement(Sidebar, props, [AppContainer]);
};

Sidebar.propTypes = {
};

export default withTranslation()(SidebarWrapper);
