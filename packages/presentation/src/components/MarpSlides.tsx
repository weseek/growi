import Head from 'next/head';

import { marpit } from '../services/growi-marpit';

type Props = {
  children?: string,
}

export const MarpSlides = (props: Props): JSX.Element => {
  const { children } = props;

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
