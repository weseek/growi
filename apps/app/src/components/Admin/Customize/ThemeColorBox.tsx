import React from 'react';

import type { GrowiThemeMetadata } from '@growi/core';


type Props = {
  isSelected: boolean,
  metadata: GrowiThemeMetadata,
  onSelected?: () => void,
};

export const ThemeColorBox = (props: Props): JSX.Element => {

  const {
    isSelected, metadata, onSelected,
  } = props;
  const {
    name, lightBg, darkBg, lightSidebar, darkSidebar, lightIcon, darkIcon, createBtn, isPresetTheme,
  } = metadata;

  return (
    <div
      id={`theme-option-${name}`}
      className={`theme-option-container d-flex flex-column align-items-center ${isSelected ? 'active' : ''}`}
      onClick={onSelected}
    >
      <a id={name} role="button" className={`m-0 ${name} theme-button`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
          <path id="bg-l" d="M32.5,0V36.364L64,20.437V0Z" fill={lightBg} />
          <path id="bg-d" d="M32.5,36.364V64H64V20.438Z" fill={darkBg} />
          <path
            id="sidebar-l"
            d="M4.077,20.648,10.164,10.1H22.338l6.087,10.544L22.338,31.19H10.164ZM0,0V52.8l6.436-3.255v-1.8H10L17.189,44.1H6.436V42.044H21.267L32.5,36.364V0Z"
            fill={lightSidebar}
          />
          <path
            id="sidebar-d"
            d="M6.436,53.44H26.065V55.5H6.436Zm14.831-11.4h4.8v2.061H17.189L10,47.743H26.065V49.8l-19.629,0v-.259L0,52.8V64H32.5V36.364Z"
            fill={darkSidebar}
          />
          <path id="btn" d="M22.338,31.19l6.087-10.543L22.338,10.1H10.163L4.077,20.647,10.163,31.19Z" fill={createBtn} />
          <g id="icon-l">
            <path id="icon-2-2" data-name="icon-2" d="M6.436,49.543,10,47.742H6.436Z" fill={lightIcon} />
            <path id="icon-1-2" data-name="icon-1" d="M6.436,44.106H17.189l4.078-2.062H6.436Z" fill={lightIcon} />
          </g>
          <g id="icon-d">
            <path id="icon-3" d="M6.436,49.8l19.629,0V47.742H10l-3.561,1.8Z" fill={darkIcon} />
            <path id="icon-2" d="M26.065,44.106V42.044h-4.8L17.19,44.106Z" fill={darkIcon} />
            <rect id="icon-1" width="19.629" height="2.062" transform="translate(6.436 53.439)" fill={darkIcon} />
          </g>
        </svg>
        {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
          <g>
            <path d="M -1 -1 L65 -1 L65 65 L-1 65 L-1 -1 Z" fill={bg}></path>
            <path d="M -1 -1 L65 -1 L65 15 L-1 15 L-1 -1 Z" fill={topbar}></path>
            <path d="M -1 15 L15 15 L15 65 L-1 65 L-1 15 Z" fill={sidebar}></path>
            <path d="M 65 45 L65 65 L45 65 L65 45 Z" fill={accent}></path>
          </g>
        </svg> */}
      </a>
      <span className="theme-option-name"><b>{ name }</b></span>
      { !isPresetTheme && <span className="theme-option-badge badge bg-primary mt-1">Plugin</span> }
    </div>
  );

};
