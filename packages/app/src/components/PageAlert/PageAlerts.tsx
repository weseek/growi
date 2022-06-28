import {FixPageGrantAlert} from "./FixPageGrantAlert";
import {PageStaleAlert} from "./PageStaleAlert";


export const PageAlerts = (): JSX.Element => {


  return (
    <div className="row d-edit-none">
      <div className="col-sm-12">
        {/* alerts */}
        <FixPageGrantAlert/>
        <PageStaleAlert/>
      </div>
    </div>
  );
}
