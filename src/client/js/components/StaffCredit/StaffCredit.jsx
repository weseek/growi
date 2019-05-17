import React from 'react';

/**
 * Page staff credit component
 *
 * @export
 * @class StaffCredit
 * @extends {React.Component}
 */
export default class StaffCredit extends React.Component {

  render() {
    return (
      <div className="text-center credit-curtain">
        <div className="credit-body">
          <p className="title my-5">Growi Soncho</p>
          <span className="dev-position">1st</span>
          <p className="dev-name mb-5">Sou Mizobuchi</p>
          <span className="dev-position">2nd</span>
          <p className="dev-name mb-5">Yusuke Takizawa</p>
        </div>
      </div>
    );
  }

}

StaffCredit.propTypes = {
};
