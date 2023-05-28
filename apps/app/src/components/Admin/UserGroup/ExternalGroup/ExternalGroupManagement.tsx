import { FC, useMemo, useState } from 'react';

import { TabContent, TabPane } from 'reactstrap';

import CustomNav from '~/components/CustomNavigation/CustomNav';

import { LDAPGroupSyncSettingsForm } from './LDAPGroupSyncSettingsForm';

export const ExternalGroupManagement: FC = () => {
  const [activeTab, setActiveTab] = useState('ldap');
  const [activeComponents, setActiveComponents] = useState(new Set(['ldap']));

  const switchActiveTab = (selectedTab) => {
    setActiveTab(selectedTab);
    setActiveComponents(activeComponents.add(selectedTab));
  };

  const navTabMapping = useMemo(() => {
    return {
      ldap: {
        Icon: () => <i className="fa fa-sitemap" />,
        i18n: 'LDAP',
      },
    };
  }, []);

  return <>
    <h2 className="border-bottom">外部グループ管理</h2>
    <CustomNav
      activeTab={activeTab}
      navTabMapping={navTabMapping}
      onNavSelected={switchActiveTab}
      hideBorderBottom
      breakpointToSwitchDropdownDown="md"
    />
    <TabContent activeTab={activeTab} className="p-5">
      <TabPane tabId="ldap">
        {activeComponents.has('ldap') && <LDAPGroupSyncSettingsForm />}
      </TabPane>
    </TabContent>
  </>;
};
