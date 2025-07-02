import React, { type JSX, useState, useEffect } from 'react';

import { INLINE_ALLOWLIST_MIME_TYPES } from '../../../../server/service/file-uploader/utils/security';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

import { ALL_MIME_TYPES } from './allMimeTypes';
import { MODERATE_MIME_TYPES } from './moderate';
import { STRICT_MIME_TYPES } from './strict';

export const InlineFileTypeSelector = (): JSX.Element => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [policy, setPolicy] = useState<'strict' | 'moderate' | 'lax' | 'manual'>('strict');

  useEffect(() => {
    setSelected(new Set(INLINE_ALLOWLIST_MIME_TYPES));
  }, []);

  const policyChange = (value: typeof policy) => {
    setPolicy(value);

    if (value === 'strict') {
      setSelected(new Set(STRICT_MIME_TYPES));
    }
    else if (value === 'moderate') {
      setSelected(new Set(MODERATE_MIME_TYPES));
    }
    else if (value === 'lax') {
      setSelected(new Set(ALL_MIME_TYPES));
    }
  };

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
        <div className="form-check form-check-inline">
          {[
            { id: 'strict', label: 'Strict (Recommended)' },
            { id: 'moderate', label: 'Moderate' },
            { id: 'lax', label: 'Lax' },
            { id: 'manual', label: 'Manual' },
          ].map(({ id, label }) => (
            <div className="form-check form-check-inline" key={id}>
              <input
                className="form-check-input"
                type="radio"
                name="inlinePolicy"
                value={id}
                id={id}
                checked={policy === id}
                onChange={e => policyChange(e.target.value as typeof policy)}
              />
              <label className="form-check-label" htmlFor={id}>{label}</label>
            </div>
          ))}
        </div>
      </div>
      <div className="dropdown">
        <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
          Permitted files
        </button>
        <ul className="dropdown-menu">
          {ALL_MIME_TYPES.map((type) => {
            const id = `inline-${type.replace('/', '-')}`;
            return (
              <li key={type} onClick={e => e.stopPropagation()}>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={id}
                    checked={selected.has(type)}
                    disabled={policy !== 'manual'}
                    onChange={() => toggleMime(type)}
                  />
                  <label className="form-check-label w-100" htmlFor={id}>
                    {type}
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
        <AdminUpdateButtonRow
          onClick={() => {
            console.log('選択されたmime types:', Array.from(selected));
          }}
        />
      </div>
    </>
  );
};
