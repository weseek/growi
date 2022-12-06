// import { faCircleArrowDown, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Link from 'next/link';

import styles from './PluginCard.module.scss';


type Props = {
  name: string,
  url: string,
  description: string,
}

export const PluginCard = (props: Props): JSX.Element => {
  const {
    name, url, description,
  } = props;
  // const [isEnabled, setIsEnabled] = useState(true);

  // const checkboxHandler = useCallback(() => {
  //   setIsEnabled(false);
  // }, []);

  return (
    <div className="card shadow border-0" key={name}>
      <div className="card-body px-5 py-4 mt-3">
        <div className="row mb-3">
          <div className="col-9">
            <h2 className="card-title h3 border-bottom pb-2 mb-3">
              <Link href={`${url}`}>{name}</Link>
            </h2>
            <p className="card-text text-muted">{description}</p>
          </div>
          <div className='col-3'>
            <div className={`${styles.plugin_card}`}>
              <div className="switch">
                <label className="switch__label">
                  <input type="checkbox" className="switch__input" checked/>
                  <span className="switch__content"></span>
                  <span className="switch__circle"></span>
                </label>
              </div>
            </div>
            {/* <div className="custom-control custom-switch custom-switch-lg custom-switch-slack">
              <input
                type="checkbox"
                className="custom-control-input border-0"
                checked={isEnabled}
                onChange={checkboxHandler}
              />
              <label className="custom-control-label align-center"></label>
            </div> */}
            {/* <Image className="mx-auto" alt="GitHub avator image" src={owner.avatar_url} width={250} height={250} /> */}
          </div>
        </div>
        <div className="row">
          <div className="col-12 d-flex flex-wrap gap-2">
            {/* {topics?.map((topic: string) => {
              return (
                <span key={`${name}-${topic}`} className="badge rounded-1 mp-bg-light-blue text-dark fw-normal">
                  {topic}
                </span>
              );
            })} */}
          </div>
        </div>
      </div>
      <div className="card-footer px-5 border-top-0 mp-bg-light-blue">
        <p className="d-flex justify-content-between align-self-center mb-0">
          <span>
            {/* {owner.login === 'weseek' ? <FontAwesomeIcon icon={faCircleCheck} className="me-1 text-primary" /> : <></>}

            <a href={owner.html_url} target="_blank" rel="noreferrer">
              {owner.login}
            </a> */}
          </span>
          {/* <span>
            <FontAwesomeIcon icon={faCircleArrowDown} className="me-1" /> {stargazersCount}
          </span> */}
        </p>
      </div>
    </div>
  );
};
