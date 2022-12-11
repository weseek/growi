import { Spinner } from 'reactstrap';

export const Loading = (): JSX.Element => {
  return (
    <Spinner className='d-flex justify-content-center aligh-items-center'>
      Loading...
    </Spinner>
  );
};
