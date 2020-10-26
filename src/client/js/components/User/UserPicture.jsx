import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { UncontrolledTooltip } from 'reactstrap';
import { userPageRoot } from '~/utils/path-utils';


const DEFAULT_IMAGE = '/images/icons/user.svg';


function getClassName(size) {
  const className = ['rounded-circle', 'picture'];
  // size
  if (size != null) {
    className.push(`picture-${size}`);
  }

  return className.join(' ');
}


const Img = (props) => {
  const { user, size } = props;

  return (
    <img
      src={user?.imageUrlCached || DEFAULT_IMAGE}
      alt={user?.username || 'someone'}
      className={getClassName(size)}
    />
  );
};

Img.propTypes = {
  user: PropTypes.object,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
};

const RootElmWithoutLink = (props) => {
  return <span id={props.id}>{props.children}</span>;
};

RootElmWithoutLink.propTypes = {
  children: PropTypes.element.isRequired,
  id: PropTypes.string,
};

const RootElmWithLink = (props) => {
  const { user } = props;
  const href = userPageRoot(user);

  return <a href={href} id={props.id}>{props.children}</a>;
};

RootElmWithLink.propTypes = {
  children: PropTypes.element.isRequired,
  id: PropTypes.string,
  user: PropTypes.object,
};


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const withTooltip = (RootElm) => {
  const id = `user-picture-${Math.random().toString(32).substring(2)}`;

  /* eslint-disable react/prop-types, @typescript-eslint/no-unused-vars */
  return (props) => {
    const { user, children } = props;

    return (
      <>
        {/* eslint-disable-next-line react/prop-types */}
        <RootElm id={id}>{props.children}</RootElm>
        <UncontrolledTooltip placement="bottom" target={id} delay={0} fade={false}>
          @{user.username}<br />
          {user.name}
        </UncontrolledTooltip>
      </>
    );
  };
  /* eslint-enable react/prop-types, @typescript-eslint/no-unused-vars */
};


const UserPicture = (props) => {

  const [isControllable, setControllable] = useState(false);

  // turn isControllable to 'true' when CSR
  useEffect(() => {
    setControllable(true);
  }, []);

  const imgElem = <Img {...props} />;

  if (!isControllable) {
    return imgElem;
  }

  const { noLink, noTooltip } = props;
  // determine RootElm
  let RootElm = noLink ? RootElmWithoutLink : RootElmWithLink;
  if (!noTooltip) {
    RootElm = withTooltip(RootElm);
  }

  return <RootElm {...props}>{imgElem}</RootElm>;
};


UserPicture.propTypes = {
  user: PropTypes.object,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  noLink: PropTypes.bool,
  noTooltip: PropTypes.bool,
};

UserPicture.defaultProps = {
  size: null,
  noLink: false,
  noTooltip: false,
};

export default UserPicture;
