import {FixPageGrantAlert} from "./FixPageGrantAlert";


export const PageAlerts = (): JSX.Element => {


  return (
    <div className="row d-edit-none">
      <div className="col-sm-12">
        {/* alerts */}
        <FixPageGrantAlert/>
      </div>
    </div>
  );
}
