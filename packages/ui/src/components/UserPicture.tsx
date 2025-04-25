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
  username: string,
  displayName: string,
  size?: UserPictureSize,
  className?: string,
  children?: ReactNode,
}

const UserPictureRootWithoutLink = forwardRef<HTMLSpanElement, UserPictureRootProps>((props, ref) => {
  return <span ref={ref} className={props.className}>{props.children}</span>;
});

const UserPictureRootWithLink = forwardRef<HTMLSpanElement, UserPictureRootProps>((props, ref) => {
  const router = useRouter();

  const { username } = props;

  const clickHandler = useCallback(() => {
    const href = pagePathUtils.userHomepagePath({ username });
    router.push(href);
  }, [router, username]);

  // Using <span> tag here instead of <a> tag because UserPicture is used in SearchResultList which is essentially a anchor tag.
  // Nested anchor tags causes a warning.
  // https://stackoverflow.com/questions/13052598/creating-anchor-tag-inside-anchor-taga
  return <span ref={ref} className={props.className} onClick={clickHandler} style={{ cursor: 'pointer' }}>{props.children}</span>;
});


// wrapper with Tooltip
const withTooltip = (UserPictureSpanElm: React.ForwardRefExoticComponent<UserPictureRootProps & React.RefAttributes<HTMLSpanElement>>) => {
  return (props: UserPictureRootProps) => {
    const { username, displayName, size } = props;

    const tooltipClassName = `${moduleTooltipClass} user-picture-tooltip-${size ?? 'md'}`;

    const userPictureRef = useRef<HTMLSpanElement>(null);

    const tooltipContent = (
      <>
        {username && <>@{username}<br /></>}
        {displayName}
      </>
    );

    return (
      <>
        <UserPictureSpanElm ref={userPictureRef} username={username} displayName={displayName}>{props.children}</UserPictureSpanElm>
        <UncontrolledTooltip
          placement="bottom"
          target={userPictureRef}
          popperClassName={tooltipClassName}
          delay={0}
          fade={false}
        >
          {tooltipContent}
        </UncontrolledTooltip>
      </>
    );
  };
};


/**
 * type guard to determine whether the specified object is IUser
 */
const hasUsername = (obj: Partial<IUser> | Ref<IUser>): obj is { username: string } => {
  return typeof obj !== 'string' && 'username' in obj;
};

/**
 * type guard to determine whether the specified object is IUser
 */
const isUserObj = (obj: Partial<IUser> | Ref<IUser>): obj is IUser => {
  return hasUsername(obj) && 'name' in obj && 'imageUrlCached' in obj;
};


type Props = {
  user?: Partial<IUser> | Ref<IUser> | null,
  size?: UserPictureSize,
  noLink?: boolean,
  noTooltip?: boolean,
  className?: string
};

export const UserPicture = memo((props: Props): JSX.Element => {
  const {
    user, size, noLink, noTooltip, className: additionalClassName,
  } = props;

  // Extract user information
  const isValidUserObj = user != null && isUserObj(user);
  const username = user != null && hasUsername(user) ? user.username : null;
  const displayName = isValidUserObj ? user.name : 'someone';
  const src = isValidUserObj ? user.imageUrlCached ?? DEFAULT_IMAGE : DEFAULT_IMAGE;

  // Determine className
  const classNames = [moduleClass, 'user-picture', 'rounded-circle'];
  if (size != null) {
    classNames.push(`user-picture-${size}`);
  }
  if (additionalClassName != null) {
    classNames.push(additionalClassName);
  }
  const className = classNames.join(' ');

  // If no valid user data, return default image
  if (!user) {
    return <img src={DEFAULT_IMAGE} alt="someone" className={className} />;
  }

  // If username is not available, return image without link and tooltip
  if (username == null) {
    return (
      <UserPictureRootWithoutLink username="" displayName={displayName}>
        <img
          src={src}
          alt={displayName}
          className={className}
        />
      </UserPictureRootWithoutLink>
    );
  }

  // Determine component based on conditions
  const shouldUseLink = !noLink;
  const UserPictureSpanElm = shouldUseLink ? UserPictureRootWithLink : UserPictureRootWithoutLink;
  const shouldShowTooltip = !noTooltip && isValidUserObj && user.name != null;
  const UserPictureRootElm = shouldShowTooltip ? withTooltip(UserPictureSpanElm) : UserPictureSpanElm;

  return (
    <UserPictureRootElm username={username} displayName={displayName} size={size}>
      <img
        src={src}
        alt={displayName}
        className={className}
      />
    </UserPictureRootElm>
  );
});
UserPicture.displayName = 'UserPicture';
