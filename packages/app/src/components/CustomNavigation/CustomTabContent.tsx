import React, { useEffect, useState } from 'react';

import PropTypes from 'prop-types';
import {
  TabContent, TabPane,
} from 'reactstrap';

import { ICustomNavTabMappings } from '~/interfaces/ui';


type Props = {
  activeTab: string,
  navTabMapping: ICustomNavTabMappings,
  additionalClassNames?: string[],

}

const CustomTabContent = (props: Props): JSX.Element => {

  const { activeTab, navTabMapping, additionalClassNames } = props;

  const [activatedContent, setActivatedContent] = useState(new Set([activeTab]));

  // add activated content to Set
  useEffect(() => {
    setActivatedContent(activatedContent.add(activeTab));
  }, [activatedContent, activeTab]);

  return (
    <TabContent activeTab={activeTab} className={additionalClassNames != null ? additionalClassNames.join(' ') : ''}>
      {Object.entries(navTabMapping).map(([key, value]) => {

        const shouldRender = key === activeTab || activatedContent.has(key);
        const { Content } = value;

        return (
          <TabPane key={key} tabId={key}>
            { shouldRender && <Content /> }
          </TabPane>
        );
      })}
    </TabContent>
  );

};

CustomTabContent.propTypes = {
  activeTab: PropTypes.string.isRequired,
  navTabMapping: PropTypes.object.isRequired,
  additionalClassNames: PropTypes.arrayOf(PropTypes.string),
};
CustomTabContent.defaultProps = {
  additionalClassNames: [],
};

export default CustomTabContent;
