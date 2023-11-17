type Props = {
  isEnabled: boolean,
}

export const FileDropzoneOverlay = (props: Props) => {
  const { isEnabled } = props;

    if (isEnabled) {
      return (
        <div className="overlay overlay-dropzone-active">
          <span className="overlay-content">
            <span className="overlay-icon material-symbols-outlined">
            </span>
          </span>
        </div>
      );
    }
    return <></>;
}
