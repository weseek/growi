import React from 'react';

import Link from 'next/link';
import PropTypes from 'prop-types';

const Username = (props) => {
  const { user } = props;

  if (user == null) {
    return <span>anyone</span>;
  }

  const name = user.name || '(no name)';
  const username = user.username;
  const href = `/user/${user.username}`;

  return (
    <Link href={href}>
      <a>{name} (@{username})</a>
    </Link>
  );
};

Username.propTypes = {
  user: PropTypes.oneOfType([PropTypes.object, PropTypes.string]), // Possibility of receiving a string of 'null'
};

export default Username;
