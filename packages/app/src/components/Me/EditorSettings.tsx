import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';


type Props = {
}

export const JapaneseTextLintRuleSettings: FC<Props> = () => {
  return (
    <></>
  );
};

export const WithoutJapaneseTextLintRulesSettings: FC<Props> = () => {
  return (
    <></>
  );
};


export const EditorSettings: FC<Props> = () => {
  const { t } = useTranslation();
  // TODO: apply i18n byGW-7244

  return (
    <>
      <h4 className="mt-4">Japanese Settings</h4>
      {/* <div className="offset-lg-2  col-lg-9">
        <div className="row"> */}

      <div className="form-group row">
        <div className="offset-md-3 col-md-6 text-left">

          <div className="custom-control custom-switch custom-checkbox-success">
            <input
              type="checkbox"
              className="custom-control-input"
              id="highlightBorder"
              // checked={adminCustomizeContainer.state.isHighlightJsStyleBorderEnabled}
              // onChange={() => { adminCustomizeContainer.switchHighlightJsStyleBorder() }}
            />
            <label className="custom-control-label" htmlFor="highlightBorder">
              <strong>Border</strong>
            </label>
          </div>

          <div className="custom-control custom-switch custom-checkbox-success">
            <input
              type="checkbox"
              className="custom-control-input"
              id="highlightBorder"
              // checked={adminCustomizeContainer.state.isHighlightJsStyleBorderEnabled}
              // onChange={() => { adminCustomizeContainer.switchHighlightJsStyleBorder() }}
            />
            <label className="custom-control-label" htmlFor="highlightBorder">
              <strong>Border</strong>
            </label>
          </div>

          <div className="custom-control custom-switch custom-checkbox-success">
            <input
              type="checkbox"
              className="custom-control-input"
              id="highlightBorder"
              // checked={adminCustomizeContainer.state.isHighlightJsStyleBorderEnabled}
              // onChange={() => { adminCustomizeContainer.switchHighlightJsStyleBorder() }}
            />
            <label className="custom-control-label" htmlFor="highlightBorder">
              <strong>Border</strong>
            </label>
          </div>

          <div className="custom-control custom-switch custom-checkbox-success">
            <input
              type="checkbox"
              className="custom-control-input"
              id="highlightBorder"
              // checked={adminCustomizeContainer.state.isHighlightJsStyleBorderEnabled}
              // onChange={() => { adminCustomizeContainer.switchHighlightJsStyleBorder() }}
            />
            <label className="custom-control-label" htmlFor="highlightBorder">
              <strong>Border</strong>
            </label>
          </div>

          <div className="custom-control custom-switch custom-checkbox-success">
            <input
              type="checkbox"
              className="custom-control-input"
              id="highlightBorder"
              // checked={adminCustomizeContainer.state.isHighlightJsStyleBorderEnabled}
              // onChange={() => { adminCustomizeContainer.switchHighlightJsStyleBorder() }}
            />
            <label className="custom-control-label" htmlFor="highlightBorder">
              <strong>Border</strong>
            </label>
          </div>

          <div className="custom-control custom-switch custom-checkbox-success">
            <input
              type="checkbox"
              className="custom-control-input"
              id="highlightBorder"
              // checked={adminCustomizeContainer.state.isHighlightJsStyleBorderEnabled}
              // onChange={() => { adminCustomizeContainer.switchHighlightJsStyleBorder() }}
            />
            <label className="custom-control-label" htmlFor="highlightBorder">
              <strong>Border</strong>
            </label>
          </div>

          <div className="custom-control custom-switch custom-checkbox-success">
            <input
              type="checkbox"
              className="custom-control-input"
              id="highlightBorder"
              // checked={adminCustomizeContainer.state.isHighlightJsStyleBorderEnabled}
              // onChange={() => { adminCustomizeContainer.switchHighlightJsStyleBorder() }}
            />
            <label className="custom-control-label" htmlFor="highlightBorder">
              <strong>Border</strong>
            </label>
          </div>

          <div className="custom-control custom-switch custom-checkbox-success">
            <input
              type="checkbox"
              className="custom-control-input"
              id="highlightBorder"
              // checked={adminCustomizeContainer.state.isHighlightJsStyleBorderEnabled}
              // onChange={() => { adminCustomizeContainer.switchHighlightJsStyleBorder() }}
            />
            <label className="custom-control-label" htmlFor="highlightBorder">
              <strong>Border</strong>
            </label>
          </div>

          <div className="custom-control custom-switch custom-checkbox-success">
            <input
              type="checkbox"
              className="custom-control-input"
              id="highlightBorder"
              // checked={adminCustomizeContainer.state.isHighlightJsStyleBorderEnabled}
              // onChange={() => { adminCustomizeContainer.switchHighlightJsStyleBorder() }}
            />
            <label className="custom-control-label" htmlFor="highlightBorder">
              <strong>Border</strong>
            </label>
          </div>

          <div className="custom-control custom-switch custom-checkbox-success">
            <input
              type="checkbox"
              className="custom-control-input"
              id="highlightBorder"
              // checked={adminCustomizeContainer.state.isHighlightJsStyleBorderEnabled}
              // onChange={() => { adminCustomizeContainer.switchHighlightJsStyleBorder() }}
            />
            <label className="custom-control-label" htmlFor="highlightBorder">
              <strong>Border</strong>
            </label>
          </div>

          <div className="custom-control custom-switch custom-checkbox-success">
            <input
              type="checkbox"
              className="custom-control-input"
              id="highlightBorder"
              // checked={adminCustomizeContainer.state.isHighlightJsStyleBorderEnabled}
              // onChange={() => { adminCustomizeContainer.switchHighlightJsStyleBorder() }}
            />
            <label className="custom-control-label" htmlFor="highlightBorder">
              <strong>Border</strong>
            </label>
          </div>

          <div className="custom-control custom-switch custom-checkbox-success">
            <input
              type="checkbox"
              className="custom-control-input"
              id="highlightBorder"
              // checked={adminCustomizeContainer.state.isHighlightJsStyleBorderEnabled}
              // onChange={() => { adminCustomizeContainer.switchHighlightJsStyleBorder() }}
            />
            <label className="custom-control-label" htmlFor="highlightBorder">
              <strong>Border</strong>
            </label>
          </div>

          <div className="custom-control custom-switch custom-checkbox-success">
            <input
              type="checkbox"
              className="custom-control-input"
              id="highlightBorder"
              // checked={adminCustomizeContainer.state.isHighlightJsStyleBorderEnabled}
              // onChange={() => { adminCustomizeContainer.switchHighlightJsStyleBorder() }}
            />
            <label className="custom-control-label" htmlFor="highlightBorder">
              <strong>Border</strong>
            </label>
          </div>

          <div className="row my-3">
            <div className="offset-4 col-5">
              <button type="button" className="btn btn-primary">
                {t('Update')}
              </button>
            </div>
          </div>

        </div>
      </div>


      <h4 className="mt-4">Common Settings</h4>

      <div className="form-group row">
        <div className="offset-md-3 col-md-6 text-left">

          <div className="custom-control custom-switch custom-checkbox-success">
            <input
              type="checkbox"
              className="custom-control-input"
              id="highlightBorder"
              // checked={adminCustomizeContainer.state.isHighlightJsStyleBorderEnabled}
              // onChange={() => { adminCustomizeContainer.switchHighlightJsStyleBorder() }}
            />
            <label className="custom-control-label" htmlFor="highlightBorder">
              <strong>Border</strong>
            </label>
          </div>

          <div className="custom-control custom-switch custom-checkbox-success">
            <input
              type="checkbox"
              className="custom-control-input"
              id="highlightBorder"
              // checked={adminCustomizeContainer.state.isHighlightJsStyleBorderEnabled}
              // onChange={() => { adminCustomizeContainer.switchHighlightJsStyleBorder() }}
            />
            <label className="custom-control-label" htmlFor="highlightBorder">
              <strong>Border</strong>
            </label>
          </div>

          <div className="custom-control custom-switch custom-checkbox-success">
            <input
              type="checkbox"
              className="custom-control-input"
              id="highlightBorder"
              // checked={adminCustomizeContainer.state.isHighlightJsStyleBorderEnabled}
              // onChange={() => { adminCustomizeContainer.switchHighlightJsStyleBorder() }}
            />
            <label className="custom-control-label" htmlFor="highlightBorder">
              <strong>Border</strong>
            </label>
          </div>

          <div className="row my-3">
            <div className="offset-4 col-5">
              <button type="button" className="btn btn-primary">
                {t('Update')}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
