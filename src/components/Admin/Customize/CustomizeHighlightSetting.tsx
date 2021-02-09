import { FC, memo, useEffect } from 'react';
import {
  UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';

import { useTranslation } from '~/i18n';

import { useCustomizeSettingsSWR } from '~/stores/admin';
import { toastSuccess, toastError } from '~/client/js/util/apiNotification';
import { apiv3Put } from '~/utils/apiv3-client';

/* eslint-disable quote-props, no-multi-spaces */
const highlightJsCssSelectorOptions = {
  'github':           { name: '[Light] GitHub',         border: false },
  'github-gist':      { name: '[Light] GitHub Gist',    border: true },
  'atom-one-light':   { name: '[Light] Atom One Light', border: true },
  'xcode':            { name: '[Light] Xcode',          border: true },
  'vs':               { name: '[Light] Vs',             border: true },
  'atom-one-dark':    { name: '[Dark] Atom One Dark',   border: false },
  'hybrid':           { name: '[Dark] Hybrid',          border: false },
  'monokai':          { name: '[Dark] Monokai',         border: false },
  'tomorrow-night':   { name: '[Dark] Tomorrow Night',  border: false },
  'vs2015':           { name: '[Dark] Vs 2015',         border: false },
};
/* eslint-enable quote-props, no-multi-spaces */

const highlightJsStyleInputName = 'highlightJsStyle';
const highlightJsStyleBorderInputName = 'highlightJsStyleBorder';


type FormValues = {
  [highlightJsStyleInputName]: string;
  [highlightJsStyleBorderInputName]: boolean;
}

const HljsDemo = memo((props:{isEnabledStyleBorder:boolean}) => {

  /* eslint-disable max-len */
  const html = `
    <span class="hljs-function"><span class="hljs-keyword">function</span> <span class="hljs-title">MersenneTwister</span>(<span class="hljs-params">seed</span>) </span>{
    <span class="hljs-keyword">if</span> (<span class="hljs-built_in">arguments</span>.length == <span class="hljs-number">0</span>) {
      seed = <span class="hljs-keyword">new</span> <span class="hljs-built_in">Date</span>().getTime();
    }

    <span class="hljs-keyword">this</span>._mt = <span class="hljs-keyword">new</span> <span class="hljs-built_in">Array</span>(<span class="hljs-number">624</span>);
    <span class="hljs-keyword">this</span>.setSeed(seed);
    }</span>`;
  /* eslint-enable max-len */

  return (
    <pre className={`hljs ${!props.isEnabledStyleBorder ? 'hljs-no-border' : ''}`}>
      {/* eslint-disable-next-line react/no-danger */}
      <code dangerouslySetInnerHTML={{ __html: html }}></code>
    </pre>
  );
});

export const CustomizeHighlightSetting:FC = () => {
  const { t } = useTranslation();
  const { data, mutate } = useCustomizeSettingsSWR();

  const {
    register, handleSubmit, control, watch, setValue,
  } = useForm({
    defaultValues: {
      [highlightJsStyleInputName]: data?.[highlightJsStyleInputName],
      [highlightJsStyleBorderInputName]: data?.[highlightJsStyleBorderInputName],
    },
  });

  // watch for display dropdown label
  const highlightJsStyle = watch(highlightJsStyleInputName);
  const isEnabledStyleBorder = watch(highlightJsStyleBorderInputName);

  const submitHandler: SubmitHandler<FormValues> = async(formValues:FormValues) => {

    try {
      await apiv3Put('/customize-setting/highlight', {
        [highlightJsStyleInputName]: formValues[highlightJsStyleInputName],
        [highlightJsStyleBorderInputName]: formValues[highlightJsStyleBorderInputName],
      });
      mutate();

      toastSuccess(t('toaster.update_successed', { target: t('admin:customize_setting.code_highlight') }));
    }
    catch (err) {
      toastError(err);
    }
  };

  // change isEnableStyleBorder to recommended settings
  useEffect(() => {
    setValue(highlightJsStyleBorderInputName, highlightJsCssSelectorOptions[highlightJsStyle]?.border);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightJsStyle]);

  useEffect(() => {
    setValue(highlightJsStyleInputName, data?.[highlightJsStyleInputName]);
    setValue(highlightJsStyleBorderInputName, data?.[highlightJsStyleBorderInputName]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.[highlightJsStyleInputName], data?.[highlightJsStyleBorderInputName]]);

  return (
    <div className="row">
      <form role="form" className="col-md-12" onSubmit={handleSubmit(submitHandler)}>
        <h2 className="admin-setting-header">{t('admin:customize_setting.code_highlight')}</h2>

        <div className="form-group row">
          <div className="offset-md-3 col-md-6 text-left">
            <div className="my-0 w-100">
              <label>{t('admin:customize_setting.theme')}</label>
            </div>
            <Controller
              name={highlightJsStyleInputName}
              control={control}
              render={({ onChange }) => {
                return (
                  <UncontrolledDropdown>
                    <DropdownToggle className="text-right col-6" caret>
                      <span className="float-left">{highlightJsCssSelectorOptions[highlightJsStyle]?.name}</span>
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-menu" role="menu">
                      {Object.keys(highlightJsCssSelectorOptions).map((themeName) => {
                        return (
                          <DropdownItem key={themeName} role="presentation" onClick={() => onChange(themeName)}>
                            <a role="menuitem">{themeName}</a>
                          </DropdownItem>
                        );
                      })}
                    </DropdownMenu>
                  </UncontrolledDropdown>
                );
              }}
            />
            <p className="form-text text-warning">
              {/* eslint-disable-next-line react/no-danger */}
              <span dangerouslySetInnerHTML={{ __html: t('admin:customize_setting.nocdn_desc') }} />
            </p>
          </div>
        </div>

        <div className="form-group row">
          <div className="offset-md-3 col-md-6 text-left">
            <div className="custom-control custom-switch custom-checkbox-success">
              <input
                name={highlightJsStyleBorderInputName}
                type="checkbox"
                className="custom-control-input"
                id="highlightBorder"
                ref={register}
              />
              <label className="custom-control-label" htmlFor="highlightBorder">
                <strong>Border</strong>
              </label>
            </div>
          </div>
        </div>

        <div className="form-text text-muted">
          <label>Examples:</label>
          <div className="wiki">
            <HljsDemo isEnabledStyleBorder={isEnabledStyleBorder} />
          </div>
        </div>

        <div className="row my-3">
          <div className="mx-auto">
            <button type="submit" className="btn btn-primary">{ t('Update') }</button>
          </div>
        </div>
      </form>
    </div>
  );
};
