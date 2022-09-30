import React, {
  FC, useCallback, useEffect, useState,
} from 'react';

import canvasToBlob from 'async-canvas-to-blob';
import { useTranslation } from 'react-i18next';
import ReactCrop from 'react-image-crop';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';

import { toastError } from '~/client/util/apiNotification';
import loggerFactory from '~/utils/logger';
import 'react-image-crop/dist/ReactCrop.css';

const logger = loggerFactory('growi:ImageCropModal');

interface ICropOptions {
  aspect: number
  unit: string,
  x: number
  y: number
  width: number,
  height: number,
}

type CropOptions = ICropOptions | null

type Props = {
  isShow: boolean,
  src: string | ArrayBuffer | null,
  onModalClose: () => void,
  onImageProcessCompleted: (res: any) => void,
  isCircular: boolean,
  showCropOption: boolean
}
const ImageCropModal: FC<Props> = (props: Props) => {

  const {
    isShow, src, onModalClose, onImageProcessCompleted, isCircular, showCropOption,
  } = props;

  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  const [cropOptions, setCropOtions] = useState<CropOptions>(null);
  const [isCropImage, setIsCropImage] = useState<boolean>(true);
  const { t } = useTranslation();
  const reset = useCallback(() => {
    if (imageRef) {
      //  Some SVG files may not have width and height properties, causing the render size to be 0x0
      // Check if image has width and height property
      const isImageSizeSet = (imageRef.width || imageRef.height) > 0;

      // If the image has no width and height,
      // Create a temporary image and take the width and height then set it to imageRef

      // TODO: Optimize code and research for another approach to set image width & height
      if (!isImageSizeSet) {
        const tempImage = new Image();
        tempImage.src = imageRef.src;
        imageRef.width = tempImage.width;
        imageRef.height = tempImage.height;
      }
      const size = Math.min(imageRef.width, imageRef.height);
      setCropOtions({
        aspect: 1,
        unit: 'px',
        x: imageRef.width / 2 - size / 2,
        y: imageRef.height / 2 - size / 2,
        width: size,
        height: size,
      });
    }
  }, [imageRef]);

  useEffect(() => {
    document.body.style.position = 'static';
    setIsCropImage(true);
    reset();
  }, [reset]);

  const onImageLoaded = (image) => {
    setImageRef(image);
    reset();
    return false;
  };


  const onCropChange = (crop) => {
    setCropOtions(crop);
  };

  const getCroppedImg = async(image, crop) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, crop.width, crop.height);
    try {
      const blob = await canvasToBlob(canvas);
      return blob;
    }
    catch (err) {
      logger.error(err);
      toastError(new Error('Failed to draw image'));
    }
  };

  // Convert base64 Image to blob
  const convertBase64ToBlob = async(base64Image: string) => {
    const base64Response = await fetch(base64Image);
    return base64Response.blob();
  };


  // Clear image and set isImageCrop true on modal close
  const onModalCloseHandler = async() => {
    setImageRef(null);
    onModalClose();
  };

  // Process and save image
  // Cropping image is optional
  // If crop is active , the saved image is cropped image (png). Otherwise, the original image will be saved (Original size and file type)
  const processAndSaveImage = async() => {
    if (imageRef && cropOptions?.width && cropOptions.height) {
      const processedImage = isCropImage ? await getCroppedImg(imageRef, cropOptions) : await convertBase64ToBlob(imageRef.src);
      // Save image to database
      onImageProcessCompleted(processedImage);
    }
    onModalCloseHandler();
  };

  return (
    <Modal isOpen={isShow} toggle={onModalCloseHandler}>
      <ModalHeader tag="h4" toggle={onModalCloseHandler} className="bg-info text-light">
        {t('crop_image_modal.image_crop')}
      </ModalHeader>
      <ModalBody className="my-4">
        {
          isCropImage
            ? (<ReactCrop src={src} crop={cropOptions} onImageLoaded={onImageLoaded} onChange={onCropChange} circularCrop={isCircular} />)
            : (<img style={{ maxWidth: imageRef?.width }} src={imageRef?.src} />)
        }
      </ModalBody>
      <ModalFooter>
        <button type="button" className="btn btn-outline-danger rounded-pill mr-auto" onClick={reset}>
          {t('crop_image_modal.reset')}
        </button>
        { !showCropOption && (
          <div className="mr-auto">
            <div className="custom-control custom-switch ">
              <input
                id="cropImageOption"
                className="custom-control-input mr-auto"
                type="checkbox"
                checked={isCropImage}
                onChange={() => { setIsCropImage(!isCropImage) }}
              />
              <label className="custom-control-label" htmlFor="cropImageOption">
                { t('crop_image_modal.image_crop') }
              </label>
            </div>
          </div>
        )
        }
        <button type="button" className="btn btn-outline-secondary rounded-pill mr-2" onClick={onModalCloseHandler}>
          {t('crop_image_modal.cancel')}
        </button>
        <button type="button" className="btn btn-outline-primary rounded-pill" onClick={processAndSaveImage}>
          { isCropImage ? t('crop_image_modal.crop') : t('crop_image_modal.save') }
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default ImageCropModal;
