import { FC, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { TabContent, TabPane } from 'reactstrap';

import CustomNav from '~/components/CustomNavigation/CustomNav';

import { LdapGroupManagement } from './LdapGroupManagement';

export const ExternalGroupManagement: FC = () => {
  const [activeTab, setActiveTab] = useState('ldap');
  const [activeComponents, setActiveComponents] = useState(new Set(['ldap']));
  const { t } = useTranslation('admin');

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
    <h2 className="border-bottom">{t('external_user_group.management')}</h2>
    <CustomNav
      activeTab={activeTab}
      navTabMapping={navTabMapping}
      onNavSelected={switchActiveTab}
      hideBorderBottom
      breakpointToSwitchDropdownDown="md"
    />
    <TabContent activeTab={activeTab} className="p-5">
      <TabPane tabId="ldap">
        {activeComponents.has('ldap') && <LdapGroupManagement />}
      </TabPane>
    </TabContent>
  </>;
};
