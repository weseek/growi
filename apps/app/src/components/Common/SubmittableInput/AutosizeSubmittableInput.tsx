import type {
  ReactElement,
} from 'react';

import type { AutosizeInputProps } from 'react-input-autosize';
import AutosizeInput from 'react-input-autosize';

import type { SubmittableInputProps } from './types';
import { useSubmittable } from './use-submittable';


export const AutosizeSubmittableInput = (props: SubmittableInputProps<AutosizeInputProps>): ReactElement<AutosizeInput> => {

  const submittableProps = useSubmittable(props);

  return (
    <AutosizeInput {...submittableProps} />
  );
};
