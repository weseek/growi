import { UncontrolledTooltip } from 'reactstrap';

type Props = {
  id: string,
  label: string,
  children: JSX.Element,
  additionalClasses?: string
}

export const IconWithTooltip = (props: Props): JSX.Element => {
  const {
    id, label, children, additionalClasses,
  } = props;

  return (
    <>
      <div id={id} className={`${additionalClasses != null ? additionalClasses : ''}`}>{children}</div>
      <UncontrolledTooltip placement="bottom" fade={false} target={id}>{label}</UncontrolledTooltip>
    </>
  );
};
