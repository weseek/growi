
// Suspense integrations like Relay implement
// a contract like this to integrate with React.
// Real implementations can be significantly more complex.

import Axios from 'axios';

// Don't copy-paste this into your project!
function wrapPromise(promise) {
  let status = 'pending';
  let result;
  const suspender = promise.then(
    (r) => {
      status = 'success';
      result = r;
    },
    (e) => {
      status = 'error';
      result = e;
    },
  );
  return {
    read() {
      if (status === 'pending') {
        throw suspender;
      }
      else if (status === 'error') {
        throw result;
      }
      else if (status === 'success') {
        return result;
      }
    },
  };
}

function fetchUser() {
  console.log('fetch user...');
  return Axios.get('/api/v2/authenticated_user/items?page=1&per_page=20');
}

function fetchProfileData() {
  const userPromise = fetchUser();

  return wrapPromise(userPromise);
}


export default fetchProfileData;
