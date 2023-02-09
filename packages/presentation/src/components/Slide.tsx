import React, { ReactNode } from 'react';

// import { Marp } from '@marp-team/marp-core';
import Head from 'next/head';


type SlidesProps = {
  children?: ReactNode,
}

export const Slides = (props: SlidesProps): JSX.Element => {
  // const marp = new Marp();
  // const { css } = marp.render('', { htmlAsArray: true });
  return (
    <>
      <Head>
        {/* <style>{css}</style> */}
      </Head>
      <div className="marpit">{props.children}</div>
    </>
  );
};

type SlideProps = {
  children?: ReactNode,
}

export const Slide = (props: SlideProps): JSX.Element => {
  return (
    <svg data-marpit-svg viewBox="0 0 1280 960">
      <foreignObject width="1280" height="960">
        <section>{props.children}</section>
      </foreignObject>
    </svg>
  );
};
