import {
  type ReactNode, type JSX,
  memo, forwardRef, useCallback, useRef,
} from 'react';

import type { Ref, IUser } from '@growi/core';
import { pagePathUtils } from '@growi/core/dist/utils';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import type { UncontrolledTooltipProps } from 'reactstrap';

const UncontrolledTooltip = dynamic<UncontrolledTooltipProps>(() => import('reactstrap').then(mod => mod.UncontrolledTooltip), { ssr: false });

const DEFAULT_IMAGE = '/images/icons/user.svg';


type UserPictureRootProps = {
  user: IUser,
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
    const { user } = props;

    const userPictureRef = useRef<HTMLSpanElement>(null);

    return (
      <>
        <UserPictureSpanElm ref={userPictureRef} user={user}>{props.children}</UserPictureSpanElm>
        {userPictureRef.current != null && (
          <UncontrolledTooltip placement="bottom" target={userPictureRef.current} delay={0} fade={false}>
            @{user.username}<br />
            {user.name}
          </UncontrolledTooltip>
        )}
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
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl',
  noLink?: boolean,
  noTooltip?: boolean,
  additionalClassName?: string
};

export const UserPicture = memo((props: Props): JSX.Element => {

  const {
    user, size, noLink, noTooltip, additionalClassName,
  } = props;

  const classNames = ['rounded-circle', 'picture'];
  if (size != null) {
    classNames.push(`picture-${size}`);
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
    <UserPictureRootElm user={user}>
      <img
        src={userPictureSrc}
        alt={user.username}
        className={className}
      />
    </UserPictureRootElm>
  );
});
UserPicture.displayName = 'UserPicture';
