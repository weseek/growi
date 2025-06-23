import React, { type JSX, useState, useEffect } from 'react';

import { INLINE_ALLOWLIST_MIME_TYPES } from '../../../../server/service/file-uploader/utils/security';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

import { ALL_MIME_TYPES } from './allMimeTypes';

export const Inline = (): JSX.Element => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  useEffect(() => {
    setSelected(new Set(INLINE_ALLOWLIST_MIME_TYPES));
  }, []);

  const toggleMime = (type: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      }
      else {
        next.add(type);
      }
      return next;
    });
  };

  return (
    <>
      <div>
        {/* <div key={locale} className="form-check form-check-inline">
          <input
            type="radio"
            id={`radioLang${locale}`}
            className="form-check-input"
            name="globalLang"
            value={locale}
            checked={adminAppContainer.state.globalLang === locale}
            onChange={(e) => {
              adminAppContainer.changeGlobalLang(e.target.value);
            }}
          />
          <label className="form-label form-check-label" htmlFor={`radioLang${locale}`}>{fixedT('meta.display_name')}</label>
        </div> */}
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name="flexRadioDefault"
            id="strict"
          />
          <label className="form-check-label" htmlFor="strict">
            Strict (Recommended)
          </label>
        </div>
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name="flexRadioDefault"
            id="moderate"
          />
          <label className="form-check-label" htmlFor="moderate">
            Moderate
          </label>
        </div>
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name="flexRadioDefault"
            id="lax"
          />
          <label className="form-check-label" htmlFor="lax">
            Lax
          </label>
        </div>
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name="flexRadioDefault"
            id="manual"
          />
          <label className="form-check-label" htmlFor="manual">
            Manual
          </label>
        </div>
      </div>
      <div className="dropdown">
        <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          Permitted files
        </button>
        <ul className="dropdown-menu">
          {ALL_MIME_TYPES.map((type) => {
            const id = `inline-${type.replace('/', '-')}`;
            const isChecked = selected.has(type);
            return (
              <div>
                <li key={type} onClick={e => e.stopPropagation()}>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={id}
                      checked={isChecked}
                      onChange={() => toggleMime(type)}
                    />
                    <label className="form-check-label w-100" htmlFor={id}>
                      {type}
                    </label>
                  </div>
                </li>
              </div>
            );
          })}
        </ul>
        {/* <AdminUpdateButtonRow onClick={this.onClickSubmit} disabled={adminMarkDownContainer.state.retrieveError != null} /> */}
        <AdminUpdateButtonRow />
      </div>
    </>
  );
};
