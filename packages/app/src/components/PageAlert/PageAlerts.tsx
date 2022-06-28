import { FixPageGrantAlert } from "./FixPageGrantAlert";
import { PageGrantAlert } from "./PageGrantAlert";


export const PageAlerts = (): JSX.Element => {


  return (
    <div className="row d-edit-none">
      <div className="col-sm-12">
        {/* alerts */}
        <FixPageGrantAlert/>

        <PageGrantAlert/>
      </div>
    </div>
  );
}
