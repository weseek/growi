import { FixPageGrantAlert } from "./FixPageGrantAlert";
import { PageGrantAlert } from "./PageGrantAlert";
import { PageStaleAlert } from "./PageStaleAlert";
import { UnlinkAlert } from "./UnlinkAlert";

export const PageAlerts = (): JSX.Element => {

  return (
    <div className="row d-edit-none">
      <div className="col-sm-12">
        {/* alerts */}
        <FixPageGrantAlert/>
        <PageGrantAlert/>
        <PageStaleAlert/>
        <UnlinkAlert/>
      </div>
    </div>
  );
}
