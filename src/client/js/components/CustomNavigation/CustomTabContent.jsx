import React from 'react';
import PropTypes from 'prop-types';
import {
  TabContent, TabPane,
} from 'reactstrap';

const CustomTabContent = (props) => {

  const { activeTab, navTabMapping, additionalClassNames } = props;

  return (
    <TabContent activeTab={activeTab} className={additionalClassNames.join(' ')}>
      {Object.entries(navTabMapping).map(([key, value]) => {

        const { Content } = value;

        return (
          <TabPane key={key} tabId={key}>
            <Content />
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
