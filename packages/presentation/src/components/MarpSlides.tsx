import { Marp } from '@marp-team/marp-core';
import Head from 'next/head';

import './Slides.global.scss';

type Props = {
  children?: string,
  marpit: Marp,
}

export const MarpSlides = (props: Props): JSX.Element => {
  const { children, marpit } = props;

  const { html, css } = marpit.render(children ?? '');
  return (
    <>
      <Head>
        <style>{css}</style>
      </Head>
      <div
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          // DOMpurify.sanitize delete elements in <svg> so sanitize is not used here.
          __html: html,
        }}
      />
    </>
  );
};
