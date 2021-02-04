import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import StaffCredit from '../../StaffCredit/StaffCredit';
import AppContainer from '../../../services/AppContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';

const ShowStaffCredit = (props) => {
  const [contributors, setContributors] = useState([]);

  useEffect(() => {
    const getContributors = async() => {
      const res = await props.appContainer.apiv3Get('/staffs');
      setContributors(res.data.contributors);
    };
    getContributors();
  }, [props.appContainer]);

  // 初回のrender時は StaffCredit を render しないようにする
  if (contributors.length === 0) {
    return <></>;
  }

  return <StaffCredit contributors={contributors} onClosed={() => props.onDeleteRender(this)} />;
};

const ShowStaffCreditWrapper = withUnstatedContainers(ShowStaffCredit, [AppContainer]);

ShowStaffCredit.propTypes = {
  onDeleteRender: PropTypes.func.isRequired,
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

ShowStaffCreditWrapper.getHotkeyStrokes = () => {
  return [['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']];
};

export default ShowStaffCreditWrapper;
