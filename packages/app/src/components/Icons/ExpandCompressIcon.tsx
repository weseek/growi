import React from 'react';

type Props = {
  isExpanded: boolean
}
const ExpandCompressIcon = (props: Props): JSX.Element => {
  const { isExpanded } = props;

  return (
    <>
      {isExpanded ? (
        <svg xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 45 45"
        >
          <path
            fill="currentColor"
            d="M8.1 44v-3h31.8v3Zm16-4.5-7.6-7.6 2.15-2.15
            3.95 3.95V14.3l-3.95 3.95-2.15-2.15 7.6-7.6 7.6 7.6-2.15
            2.15-3.95-3.95v19.4l3.95-3.95 2.15 2.15ZM8.1 7V4h31.8v3Z"
          />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 45 45"
        >
          <path
            fill="currentColor"
            d="M22.45 44v-7.9l-3.85 3.8-2.1-2.1 7.45-7.4 7.35 7.4-2.1
            2.1-3.75-3.8V44ZM8.05 27.5v-3H40v3Zm0-6.05v-3H40v3Zm15.9-5.85-7.4-7.4 2.1-2.1
            3.75 3.8V2h3v7.9l3.85-3.8 2.1 2.1Z"/>
        </svg>
      )
      }
    </>
  );

};

export default ExpandCompressIcon;
