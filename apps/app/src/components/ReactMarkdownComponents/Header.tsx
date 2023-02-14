import { useCallback, useEffect, useState } from 'react';

import EventEmitter from 'events';

import { useRouter } from 'next/router';
import { Element } from 'react-markdown/lib/rehype-filter';

import { useIsGuestUser, useIsSharedUser, useShareLinkId } from '~/stores/context';
import loggerFactory from '~/utils/logger';

import { NextLink } from './NextLink';

import styles from './Header.module.scss';


const logger = loggerFactory('growi:components:Header');

declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var globalEmitter: EventEmitter;
}


function setCaretLine(line?: number): void {
  if (line != null) {
    globalEmitter.emit('setCaretLine', line);
  }
}

type EditLinkProps = {
  line?: number,
}

/**
 * Inner FC to display edit link icon
 */
const EditLink = (props: EditLinkProps): JSX.Element => {
  const isDisabled = props.line == null;

  return (
    <span className="revision-head-edit-button">
      <a href="#edit" aria-disabled={isDisabled} onClick={() => setCaretLine(props.line)}>
        <i className="icon-note"></i>
      </a>
    </span>
  );
};


type HeaderProps = {
  children: React.ReactNode,
  node: Element,
  level: number,
  id?: string,
}

export const Header = (props: HeaderProps): JSX.Element => {
  const {
    node, id, children, level,
  } = props;

  const { data: isGuestUser } = useIsGuestUser();
  const { data: isSharedUser } = useIsSharedUser();
  const { data: shareLinkId } = useShareLinkId();

  const router = useRouter();

  const [isActive, setActive] = useState(false);

  const CustomTag = `h${level}` as keyof JSX.IntrinsicElements;

  const activateByHash = useCallback((url: string) => {
    try {
      const hash = (new URL(url, 'https://example.com')).hash.slice(1);
      setActive(hash === id);
    }
    catch (err) {
      logger.debug(err);
      setActive(false);
    }
  }, [id]);

  // init
  useEffect(() => {
    activateByHash(window.location.href);
  }, [activateByHash]);

  // update isActive when hash is changed by next router
  useEffect(() => {
    router.events.on('hashChangeComplete', activateByHash);

    return () => {
      router.events.off('hashChangeComplete', activateByHash);
    };
  }, [activateByHash, router.events]);

  // update isActive when hash is changed
  useEffect(() => {
    const activeByHashWrapper = (e: HashChangeEvent) => {
      activateByHash(e.newURL);
    };

    window.addEventListener('hashchange', activeByHashWrapper);

    return () => {
      window.removeEventListener('hashchange', activeByHashWrapper);
    };
  }, [activateByHash, router.events]);

  const showEditButton = !isGuestUser && !isSharedUser && shareLinkId == null;

  return (
    <CustomTag id={id} className={`revision-head ${styles['revision-head']} ${isActive ? 'blink' : ''}`}>
      {children}
      <NextLink href={`#${id}`} className="revision-head-link">
        <span className="icon-link"></span>
      </NextLink>
      {showEditButton && (
        <EditLink line={node.position?.start.line} />
      )}
    </CustomTag>
  );
};
