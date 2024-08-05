import React, { memo } from 'react';

import styles from './GrowiLogo.module.scss';

const moduleClass = styles['grw-logo'];

const GrowiLogo = memo(() => (
  <div className={`${moduleClass}`}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 64 56"
    >
      <path
        // eslint-disable-next-line max-len
        d="M17.123 33.8015L10.4717 45.3855C10.2686 45.7427 10.2686 46.1829 10.4717 46.5337L15.5934 55.4514C15.7838 55.7767 16.171 55.9999 16.5645 55.9999H17.123L23.5014 44.9007L17.123 33.8015Z"
        className="group1"
      />
      <path
        // eslint-disable-next-line max-len
        d="M50.8118 29.0493L42.0343 44.3331C41.8693 44.6138 41.571 44.9072 41.0632 44.9072H23.4956L17.1172 56H47.4607C47.8542 56 48.1842 55.8023 48.3873 55.4514L63.5559 29.043H50.8118V29.0493Z"
        className="group2"
      />
      <path
        // eslint-disable-next-line max-len
        d="M63.8353 28.5773C64.0447 28.22 64.0574 27.8182 63.8543 27.461L58.7262 18.5369C58.5231 18.1797 58.174 17.9501 57.7615 17.9501H26.8975C26.485 17.9501 26.1106 18.1733 25.9011 18.5178L21.0586 26.9379L27.437 38.0499L32.1272 29.8849C32.4255 29.3746 32.9713 29.0557 33.5552 29.0557H63.5624L63.8353 28.5836V28.5773Z"
        className="group1"
      />
      <path
        // eslint-disable-next-line max-len
        d="M22.956 11.0992H54.4546L48.4125 0.580476C48.2094 0.22326 47.8604 0 47.4478 0H16.5839C16.1714 0 15.7969 0.204123 15.5875 0.56134L0.152321 27.4227C-0.0507735 27.7799 -0.0507735 28.2137 0.152321 28.5709L6.20706 39.1088L21.9595 11.6606C22.1626 11.3033 22.5434 11.0928 22.956 11.0928V11.0992Z"
        className="group1"
      />
    </svg>
  </div>
));

GrowiLogo.displayName = 'GrowiLogo';

export default GrowiLogo;
