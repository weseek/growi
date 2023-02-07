import React, { ReactNode } from 'react';

import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/splide/css';


type SlidesProps = {
  children?: ReactNode,
}

export const Slides = (props: SlidesProps): JSX.Element => {
  return <Splide>{props.children}</Splide>;
};

type SlideProps = {
  children?: ReactNode,
}

export const Slide = (props: SlideProps): JSX.Element => {
  return <SplideSlide>{props.children}</SplideSlide>;
};
