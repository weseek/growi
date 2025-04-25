import {
  type ReactNode, type JSX,
  memo, forwardRef, useCallback, useRef,
} from 'react';

import type { Ref, IUser } from '@growi/core';
import { pagePathUtils } from '@growi/core/dist/utils';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import type { UncontrolledTooltipProps } from 'reactstrap';

import styles from './UserPicture.module.scss';

const moduleClass = styles['user-picture'];
const moduleTooltipClass = styles['user-picture-tooltip'];

const UncontrolledTooltip = dynamic<UncontrolledTooltipProps>(() => import('reactstrap').then(mod => mod.UncontrolledTooltip), { ssr: false });

const DEFAULT_IMAGE = '/images/icons/user.svg';


type UserPictureSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type UserPictureRootProps = {
  size?: UserPictureSize,
  className?: string,
  children?: ReactNode,
}

const UserPictureRootWithoutLink = forwardRef<HTMLSpanElement, UserPictureRootProps>((props, ref) => {
  return <span ref={ref} className={props.className}>{props.children}</span>;
});

const UserPictureRootWithLink = forwardRef<HTMLSpanElement, UserPictureRootProps>((props, ref) => {
  const router = useRouter();

  const { user } = props;

  const clickHandler = useCallback(() => {
    const href = pagePathUtils.userHomepagePath(user);
    router.push(href);
  }, [router, user]);

  // Using <span> tag here instead of <a> tag because UserPicture is used in SearchResultList which is essentially a anchor tag.
  // Nested anchor tags causes a warning.
  // https://stackoverflow.com/questions/13052598/creating-anchor-tag-inside-anchor-taga
  return <span ref={ref} className={props.className} onClick={clickHandler} style={{ cursor: 'pointer' }}>{props.children}</span>;
});


// wrapper with Tooltip
const withTooltip = (UserPictureSpanElm: React.ForwardRefExoticComponent<UserPictureRootProps & React.RefAttributes<HTMLSpanElement>>) => {
  return (props: UserPictureRootProps) => {
    const { user, size } = props;

    const tooltipClassName = `${moduleTooltipClass} user-picture-tooltip-${size ?? 'md'}`;

    const userPictureRef = useRef<HTMLSpanElement>(null);

    return (
      <>
        <UserPictureSpanElm ref={userPictureRef} user={user}>{props.children}</UserPictureSpanElm>
        <UncontrolledTooltip
          placement="bottom"
          target={userPictureRef}
          popperClassName={tooltipClassName}
          delay={0}
          fade={false}
          show
        >
          @{user.username}<br />
          {user.name}
        </UncontrolledTooltip>
      </>
    );
  };
};


/**
 * type guard to determine whether the specified object is IUser
 */
const isUserObj = (obj: Partial<IUser> | Ref<IUser>): obj is IUser => {
  return typeof obj !== 'string' && 'username' in obj;
};


type Props = {
  user?: Partial<IUser> | Ref<IUser> | null,
  size?: UserPitureSize,
  noLink?: boolean,
  noTooltip?: boolean,
  className?: string
};

export const UserPicture = memo((props: Props): JSX.Element => {

  const {
    user, size, noLink, noTooltip, className: additionalClassName,
  } = props;

  const classNames = [moduleClass, 'user-picture', 'rounded-circle'];
  if (size != null) {
    classNames.push(`user-picture-${size}`);
  }
  if (additionalClassName != null) {
    classNames.push(additionalClassName);
  }
  const className = classNames.join(' ');

  if (user == null || !isUserObj(user)) {
    return (
      <img
        src={DEFAULT_IMAGE}
        alt="someone"
        className={className}
      />
    );
  }

  // determine RootElm
  const UserPictureSpanElm = noLink ? UserPictureRootWithoutLink : UserPictureRootWithLink;
  const UserPictureRootElm = noTooltip
    ? UserPictureSpanElm
    : withTooltip(UserPictureSpanElm);

  const userPictureSrc = user.imageUrlCached ?? DEFAULT_IMAGE;

  return (
    <UserPictureRootElm user={user} size={size}>
      <img
        src={userPictureSrc}
        alt={user.username}
        className={className}
      />
    </UserPictureRootElm>
  );
});
UserPicture.displayName = 'UserPicture';
