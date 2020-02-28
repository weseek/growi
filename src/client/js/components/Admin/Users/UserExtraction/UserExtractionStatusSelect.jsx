import React from 'react';
import PropTypes from 'prop-types';

import UserExtractionCheckBox from './UserExtractionCheckBox';

class UserExtractionStatusSelect extends React.Component {

  constructor() {
    super();
    this.TypesToStatusList = this.TypesToStatusList.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.manageChange = this.manageChange.bind(this);

    this.state = {
      statusList: null,
    };
  }

  componentWillMount() {
    this.state.statusList = this.TypesToStatusList();
  }

  TypesToStatusList() {
    return this.props.statusTypes.map((statusType) => {
      return { statusType, isSelected: false };
    });
  }

  handleClick(statusType) {
    this.setState({ statusList: this.manageChange(statusType) });
  }

  manageChange(statusType) {
    const statusList = this.state.statusList.slice();
    const changedStatus = statusList.find(status => status.statusType === statusType);
    const all = 'All';

    changedStatus.isSelected = !changedStatus.isSelected;

    if (changedStatus.statusType === all) {
      if (changedStatus.isSelected) {
        statusList.map((status) => {
          status.isSelected = (status.statusType === all);
          return status;
        });
      }
    }
    else if (changedStatus.isSelected) {
      statusList.find(status => status.statusType === all).isSelected = false;
    }

    return statusList;
  }

  labelCreater(statusType) {
    const label = this.props.statusLabels[statusType.replace(/\s/g, '')];
    const className = '';
    if (label) {
      return `label label-${label}`;
    }
    return className;
  }

  render() {
    return (
      <div className="list-group-item form-group">
        {this.state.statusList.map(status => (
          <UserExtractionCheckBox
            statusType={status.statusType}
            isSelected={status.isSelected}
            label={this.labelCreater(status.statusType)}
            handleClick={this.handleClick}
          />
        ))}
      </div>
    );
  }

}

UserExtractionStatusSelect.propTypes = {
  statusTypes: PropTypes.array.isRequired,
  statusLabels: PropTypes.array,
};

export default UserExtractionStatusSelect;
