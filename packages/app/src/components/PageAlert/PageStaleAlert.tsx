
import { useIsEnabledStaleNotification } from '../../stores/context'

export const PageStaleAlert = (props):JSX.Element => {
const { data: isEnabledStaleNotification } = useIsEnabledStaleNotification()
  return (
    <>PageStaleAlert</>
  )
}
