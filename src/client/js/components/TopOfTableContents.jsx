import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import PageContainer from '../services/PageContainer';

import { withUnstatedContainers } from './UnstatedUtils';

const TopOfTableContents = (props) => {

  return (
    <>
      {/* TODO GW-3253 add four contents */}
      <div className="liker-and-seenusers d-flex align-items-end pb-1">
        <button type="button" className="bg-transparent border-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14">
            <defs>
              <style>
                {'\
                .cls-1{\
                fill: none;\
                }\
                '}
              </style>
            </defs>
            <g id="レイヤー_2" data-name="レイヤー 2">
              <g id="レイヤー_1-2" data-name="レイヤー 1">
                <rect className="cls-1" width="14" height="14" />
                <g id="グループ_678" data-name="グループ 678">
                  <path d="M12.63,2.72H1.37a.54.54,0,0,1,0-1.08H12.63a.54.54,0,0,1,0,1.08Z" />
                  <path d="M11.82,5.94H1.37a.55.55,0,0,1,0-1.09H11.82a.55.55,0,1,1,0,1.09Z" />
                  <path d="M9.41,9.15h-8a.54.54,0,0,1,0-1.08h8a.54.54,0,0,1,0,1.08Z" />
                  <path d="M10.84,12.36H1.37a.54.54,0,1,1,0-1.08h9.47a.54.54,0,1,1,0,1.08Z" />
                </g>
              </g>
            </g>
          </svg>
        </button>

        <button type="button" className="bg-transparent border-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14">
            <defs>
              <style>
                {'\
                .cls-1{\
                fill: none;\
                }\
                '}
              </style>
            </defs>
            <g id="レイヤー_2" data-name="レイヤー 2">
              <g id="レイヤー_1-2" data-name="レイヤー 1">
                <rect className="cls-1" width="14" height="14" />
                <path
                  id="Icon_material-timeline"
                  data-name="Icon material-timeline"
                  d="M13.6,4.6a1.2,1.2,0,0,1-1.2,1.2,1,1,0,0,1-.3,0L10,7.89a1.1,1.1,0,0,1,0,.31,1.2,1.2,0,1,1-2.4,0,1.1,1.1,0,0,1,
                  0-.31L6.11,6.36a1.3,1.3,0,0,1-.62,0L2.75,9.1a1,1,0,0,1,0,.3A1.2,1.2,0,1,1,1.6,8.2a1,1,0,0,1,.3,0L4.64,
                  5.51a1.1,1.1,0,0,1,0-.31A1.2,1.2,0,0,1,7,5.2a1.1,1.1,0,0,1,0,.31L8.49,7a1.3,1.3,0,0,1,.62,0L11.25,4.9a1,
                  1,0,0,1-.05-.3,1.2,1.2,0,1,1,2.4,0Z"
                />
              </g>
            </g>
          </svg>
        </button>

        <button type="button" className="bg-transparent border-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14">
            <defs>
              <style>
                {'\
                .cls-1{\
                fill: none;\
                }\
                '}
              </style>
            </defs>
            <g id="レイヤー_2" data-name="レイヤー 2">
              <g id="レイヤー_1-2" data-name="レイヤー 1">
                <rect className="cls-1" width="14" height="14" />
                <path
                  id="Icon_material-timeline"
                  data-name="Icon material-timeline"
                  d="M13.6,4.6a1.2,1.2,0,0,1-1.2,1.2,1,1,0,0,1-.3,0L10,7.89a1.1,1.1,0,0,1,0,.31,1.2,1.2,0,
                  1,1-2.4,0,1.1,1.1,0,0,1,0-.31L6.11,6.36a1.3,1.3,0,0,1-.62,0L2.75,9.1a1,1,0,0,1,0,.3A1.2,
                  1.2,0,1,1,1.6,8.2a1,1,0,0,1,.3,0L4.64,5.51a1.1,1.1,0,0,1,0-.31A1.2,1.2,0,0,1,7,5.2a1.1,
                  1.1,0,0,1,0,.31L8.49,7a1.3,1.3,0,0,1,.62,0L11.25,4.9a1,1,0,0,1-.05-.3,1.2,1.2,0,1,1,2.4,0Z"
                />
              </g>
            </g>
          </svg>
        </button>

        <button type="button" className="bg-transparent border-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14">
            <defs>
              <style>
                {'\
                .cls-1{\
                fill: none;\
                }\
                .cls-2{\
                isolation: isolate;\
                '}
              </style>
            </defs>
            <g id="レイヤー_2" data-name="レイヤー 2">
              <g id="レイヤー_1-2" data-name="レイヤー 1">
                <rect className="cls-1" width="14" height="14" />
                <g id="_" data-name=" " className="cls-2">
                  <g className="cls-2">
                    <path d="M2.9,13a2,2,0,0,1-1.44-.63,2.28,2.28,0,0,1,0-3.23l7-7.38a2.48,2.48,0,0,1,1.22-.7,2.61,
                    2.61,0,0,1,1.41.09A3.46,3.46,0,0,1,12.37,2a3.94,3.94,0,0,1,.36.45A2.61,2.61,0,0,1,13,3a3.41,3.41,
                    0,0,1,.16.57,3.06,3.06,0,0,1-.82,2.75L7.07,11.86a.35.35,0,0,1-.26.13.4.4,0,0,1-.28-.1.47.47,0,0,
                    1-.12-.27.39.39,0,0,1,.11-.29l5.26-5.59a2.28,2.28,0,0,0,.65-1.62,2.07,2.07,0,0,0-.62-1.58A2.62,2.62,
                    0,0,0,11,1.93a2,2,0,0,0-1-.13,1.63,1.63,0,0,0-1,.5L2,9.67a1.52,1.52,0,0,0,0,2.16,1.28,1.28,0,0,0,
                    .44.3,1,1,0,0,0,.51.08,1.43,1.43,0,0,0,1-.49L9.49,5.84l.12-.13.11-.15a1.24,1.24,0,0,0,.1-.2,1.94,
                    1.94,0,0,0,0-.2.6.6,0,0,0,0-.22.66.66,0,0,0-.14-.2.57.57,0,0,0-.45-.22,1,1,0,0,0-.52.3L4.56,
                    9.25a.42.42,0,0,1-.17.1.34.34,0,0,1-.2,0A.4.4,0,0,1,4,9.26.34.34,0,0,1,3.89,9,.41.41,0,0,1,4,8.72L8.16,
                    4.28a1.7,1.7,0,0,1,1-.53,1.32,1.32,0,0,1,1.06.43,1.23,1.23,0,0,1,.4,1.05,1.8,1.8,0,0,1-.58,1.14L4.52,
                    12.26A2.3,2.3,0,0,1,3,13H2.9Z"
                    />
                  </g>
                </g>
              </g>
            </g>
          </svg>

        </button>

        <div
          id="liker-list"
          data-user-ids-str="{{ page.liker|slice(-15)|default([])|reverse|join(',') }}"
          data-sum-of-likers="{{ page.liker.length|default(0) }}"
        >
        </div>
        <div
          id="seen-user-list"
          data-user-ids-str="{{ page.seenUsers|slice(-15)|default([])|reverse|join(',') }}"
          data-sum-of-seen-users="{{ page.seenUsers.length|default(0) }}"
        >
        </div>
      </div>
    </>
  );

};

/**
 * Wrapper component for using unstated
 */
const TopOfTableContentsWrapper = withUnstatedContainers(TopOfTableContents, [PageContainer]);

TopOfTableContents.propTypes = {
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default withTranslation()(TopOfTableContentsWrapper);
