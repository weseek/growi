import React, {
  Ref, useEffect, useState,
} from 'react';

import type { SWRInfiniteResponse } from 'swr/infinite';

type Props<T> = {
  swrInifiniteResponse: SWRInfiniteResponse<T>
  children: React.ReactNode,
  loadingIndicator?: React.ReactNode
  endingIndicator?: React.ReactNode
  isReachingEnd?: boolean
  offset?: number
}

const useIntersection = <E extends HTMLElement>(): [boolean, Ref<E>] => {
  const [intersecting, setIntersecting] = useState<boolean>(false);
  const [element, setElement] = useState<HTMLElement>();
  useEffect(() => {
    if (element != null) {
      const observer = new IntersectionObserver((entries) => {
        setIntersecting(entries[0]?.isIntersecting);
      });
      observer.observe(element);
      return () => observer.unobserve(element);
    }
    return;
  }, [element]);
  return [intersecting, el => el && setElement(el)];
};

const LoadingIndicator = (): React.ReactElement => {
  return (
    <div className="text-muted text-center">
      <i className="fa fa-2x fa-spinner fa-pulse mr-1"></i>
    </div>
  );
};

const InfiniteScroll = <E, >(props: Props<E>): React.ReactElement<Props<E>> => {
  const {
    swrInifiniteResponse: {
      setSize, isValidating,
    },
    children,
    loadingIndicator,
    endingIndicator,
    isReachingEnd,
    offset = 0,
  } = props;

  const [intersecting, ref] = useIntersection<HTMLDivElement>();

  useEffect(() => {
    if (intersecting && !isValidating && !isReachingEnd) {
      setSize(size => size + 1);
    }
  }, [setSize, intersecting, isValidating, isReachingEnd]);

  return (
    <>
      {children}
      <div style={{ position: 'relative' }}>
        <div ref={ref} style={{ position: 'absolute', top: offset }}></div>
        {isReachingEnd
          ? endingIndicator
          : loadingIndicator || <LoadingIndicator />
        }
      </div>
    </>
  );
};

export default InfiniteScroll;
