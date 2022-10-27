import React, {
  forwardRef, Ref, useEffect, useRef,
} from 'react';

import { IUser, pagePathUtils } from '@growi/core';
import dynamic from 'next/dynamic';


const UncontrolledTooltip = dynamic(() => import('reactstrap').then(mod => mod.UncontrolledTooltip), { ssr: false });

const { userPageRoot } = pagePathUtils;

const DEFAULT_IMAGE = '/images/icons/user.svg';


type UserPictureRootProps = {
  user: IUser,
  className?: string,
  children?: React.ReactNode,
}

type IUserPictureRootElm =
  (React.ForwardRefExoticComponent<UserPictureRootProps & React.RefAttributes<HTMLSpanElement>>)
  | ((props: UserPictureRootProps) => JSX.Element);

const UserPictureRootWithoutLink = forwardRef((props: UserPictureRootProps, ref: Ref<HTMLSpanElement>) => {
  return <span ref={ref} className={props.className}>{props.children}</span>;
});

const UserPictureRootWithLink = forwardRef((props: UserPictureRootProps, ref: Ref<HTMLSpanElement>) => {
  const { user } = props;
  const href = userPageRoot(user);
  // Using <span> tag here instead of <a> tag because UserPicture is used in SearchResultList which is essentially a anchor tag.
  // Nested anchor tags causes a warning.
  // https://stackoverflow.com/questions/13052598/creating-anchor-tag-inside-anchor-taga
  return <span ref={ref} className={props.className} onClick={() => { window.location.href = href }}>{props.children}</span>;
});

// wrapper with Tooltip
const withTooltip = (UserPictureRoot: IUserPictureRootElm): IUserPictureRootElm => {
  return (props: UserPictureRootProps) => {
    const { user } = props;

    const userPictureRef = useRef<HTMLSpanElement>(null);

    return (
      <>
        <UserPictureRoot ref={userPictureRef} user={user}>{props.children}</UserPictureRoot>
        <UncontrolledTooltip placement="bottom" target={userPictureRef} delay={0} fade={false}>
          @{user.username}<br />
          {user.name}
        </UncontrolledTooltip>
      </>
    );
  };
};


type Props = {
  user?: IUser,
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl',
  noLink?: boolean,
  noTooltip?: boolean,
};

export const UserPicture = React.memo((props: Props): JSX.Element => {

  const {
    user, size, noLink, noTooltip,
  } = props;

  const classNames = ['rounded-circle', 'picture'];
  if (size != null) {
    classNames.push(`picture-${size}`);
  }
  const className = classNames.join(' ');

  if (user == null) {
    return (
      <img
        src={DEFAULT_IMAGE}
        alt="someone"
        className={className}
      />
    );
  }

  // determine RootElm
  let UserPictureRootElm: IUserPictureRootElm = noLink ? UserPictureRootWithoutLink : UserPictureRootWithLink;
  if (!noTooltip) {
    UserPictureRootElm = withTooltip(UserPictureRootElm);
  }

  const userPictureSrc = user.imageUrlCached || DEFAULT_IMAGE;

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
