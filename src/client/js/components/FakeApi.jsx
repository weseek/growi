
function wrapPromise() {
  let status = 'pending';
  let result;

  return {
    read(promise) {
      if (status === 'pending') {
        throw promise.then(
          (r) => {
            status = 'success';
            result = r;
          },
          (e) => {
            status = 'error';
            result = e;
          },
        );
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

function fetchProfileData() {

  return wrapPromise();
}


export default fetchProfileData;
