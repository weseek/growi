import React from 'react';

class CustomizeLayoutSetting extends React.Component {

  render() {
    return (
      <form>
        <div className="col-sm-4">
          <h4>
            <div className="radio radio-primary">
              <input
                type="radio"
                id="radioLayoutGrowi"
                name="settingForm[customize:layout]"
                value="growi"
                onClick="selectableTheme(event)"
              />
              <label htmlFor="radioLayoutGrowi">
                  GROWI Enhanced Layout <small className="text-success">(Recommended)</small>
              </label>
            </div>
          </h4>
          <a href="/images/admin/customize/layout-crowi-plus.gif" className="ss-container">
            <img src="/images/admin/customize/layout-crowi-plus-thumb.gif" width="240px" />
          </a>
          <h4>Simple and Clear</h4>
          <ul>
            {/* TODO i18n */}
            <li>Full screen layout and thin margins/paddings</li>
            <li>Show and post comments at the bottom of the page</li>
            <li>Affix Table-of-contents</li>
          </ul>
        </div>
      </form>
    );
  }

}


export default CustomizeLayoutSetting;
