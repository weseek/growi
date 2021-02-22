import React from 'react';

class CustomSidebar extends React.Component {

  static propTypes = {
  };

  state = {
  };

  renderHeaderWordmark() {
    return <h3>Custom Sidebar</h3>;
  }

  render() {
    return (
      <>
        <div className="grw-sidebar-content-header p-3 d-flex">
          <h3 className="mb-0">Custom Sidebar</h3>
          <button type="button" className="btn btn-sm btn-outline-secondary ml-auto" onClick={this.reloadData}>
            <i className="icon icon-reload"></i>
          </button>
        </div>
        <div className="grw-sidebar-content-header p-3">
          (TBD) Under implementation
        </div>
      </>
    );

  }

}

export default CustomSidebar;
