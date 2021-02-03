import React, { useState } from 'react';
import { useGrowiVersion } from '~/stores/context';
import ShortcutsModal from './ShortcutsModal';

const SystemVersion = (): JSX.Element => {
  const [isShow, setIsShow] = useState(false);

  const { data: growiVersion } = useGrowiVersion();
  // add classes to cmd-key by OS
  const platform = window.navigator.platform.toLowerCase();
  const isMac = (platform.indexOf('mac') > -1);
  const os = isMac ? 'mac' : 'win';

  function onClosed() {
    setIsShow(false);
  }

  return (
    <>
      {isShow && <ShortcutsModal onClosed={onClosed} />}
      <div className="system-version d-none d-md-block d-edit-none d-print-none">
        <span>
          <a href="https://growi.org">GROWI</a> {growiVersion}
        </span>
        <button type="button" className="btn btn-link p-0" onClick={() => setIsShow(true)}>
          <i className="fa fa-keyboard-o"></i>&nbsp;<span className={`cmd-key ${os}`}></span>-/
        </button>
      </div>

    </>
  );
};

export default SystemVersion;
