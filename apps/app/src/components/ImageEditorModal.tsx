import React, { useEffect, useState, useRef } from 'react';

import Konva from 'konva';
import {
  Layer, Stage, Star, Image as KonvaImage,
} from 'react-konva';
import {
  Modal, ModalBody, ModalHeader, ModalFooter,
} from 'reactstrap';

import { apiPostForm } from '~/client/util/apiv1-client';
import { apiv3Get } from '~/client/util/apiv3-client';
import { useImageEditorModal } from '~/stores/modal';
import { useCurrentPageId, useCurrentPagePath } from '~/stores/page';

const MAX_WIDTH = 800;

type Attachment = {
  attachment: {
    tag: string;
  }
};

function resizeImage(width: number, height: number) {
  const aspectRatio = width / height;

  let newWidth: number;
  let newHeight: number;

  if (width > MAX_WIDTH) {
    newWidth = MAX_WIDTH;
    newHeight = MAX_WIDTH / aspectRatio;
  }
  else {
    newWidth = width;
    newHeight = height;
  }

  return { width: newWidth, height: newHeight };
}

function generateShapes() {
  return [...Array(10)].map((_, i) => ({
    id: i.toString(),
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    rotation: Math.random() * 180,
    isDragging: false,
  }));
}

function getAttachmentId(imageSrc?: string): string | undefined {
  if (imageSrc == null) {
    return;
  }

  const regex = /(?:https?:\/\/[^/]+)?\/attachment\/(\w+)/;
  const match = imageSrc.match(regex);

  if (match == null) {
    return;
  }

  return match[1];
}

const ImageEditorModal = (): JSX.Element => {
  const { data: imageEditorModalData, close: closeImageEditorModal } = useImageEditorModal();
  const { data: currentPageId } = useCurrentPageId();
  const { data: currentPagePath } = useCurrentPagePath();

  const [stars, setStars] = useState(generateShapes());
  const [image] = useState(new window.Image());
  const [imageWidth, setImageWidth] = useState<number>(image.naturalWidth);
  const [imageHeight, setImageHeight] = useState<number>(image.naturalHeight);
  const [attachment, setAttachment] = useState<Attachment | null>(null);

  const imageRef = useRef<Konva.Image | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);

  const handleDragStart = (e) => {
    const id = e.target.id();
    setStars(
      stars.map(star => ({
        ...star,
        isDragging: star.id === id,
      })),
    );
  };

  const handleDragEnd = () => {
    setStars(stars.map(star => ({ ...star, isDragging: false })));
  };

  const saveButtonClickHandler = async() => {
    if (stageRef.current == null || currentPageId == null || currentPagePath == null) {
      return;
    }

    try {
      const blob = await stageRef.current.toBlob({
        width: imageWidth, height: imageHeight, mimeType: 'image/jpeg',
      }) as any;

      const formData = new FormData();
      formData.append('file', blob);
      formData.append('page_id', currentPageId);
      formData.append('path', currentPagePath);

      if (attachment !== null && attachment.attachment.tag !== null) {
        formData.append('tag', attachment.attachment.tag);
      }

      const res = await apiPostForm('/attachments.add', formData) as any;
      const editedImagePath = res.attachment.filePathProxied;

      if (imageEditorModalData?.onSave != null) {
        imageEditorModalData?.onSave(editedImagePath);
      }

      closeImageEditorModal();
    }
    catch (err) {
      // TODO: Error handling
    }
  };

  useEffect(() => {
    const imageSrc = imageEditorModalData?.imageSrc;

    if (imageSrc == null) return;

    image.src = imageSrc;
    image.onload = () => {
      if (imageRef.current != null) {
        const layer = imageRef.current.getLayer();
        if (layer) {
          layer.batchDraw();
        }
      }

      const result = resizeImage(image.naturalWidth, image.naturalHeight);
      setImageWidth(result.width);
      setImageHeight(result.height);

    };
  }, [image, imageEditorModalData]);

  useEffect(() => {
    const attachmentId = getAttachmentId(imageEditorModalData?.imageSrc);

    if (attachmentId == null) {
      return;
    }

    apiv3Get(`/attachment?attachmentId=${attachmentId}`)
      .then((response) => {
        setAttachment(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [imageEditorModalData?.imageSrc]);

  return (
    <Modal
      style={{ maxWidth: '1000px' }}
      isOpen={imageEditorModalData?.isOpened ?? false}
      toggle={() => closeImageEditorModal()}
    >
      <ModalHeader>
        ヘッダー
      </ModalHeader>

      <ModalBody className="mx-auto">
        <Stage ref={stageRef} width={imageWidth} height={imageHeight}>
          <Layer>
            <KonvaImage image={image} ref={imageRef} width={imageWidth} height={imageHeight} />

            {stars.map(star => (
              <Star
                key={star.id}
                id={star.id}
                x={star.x}
                y={star.y}
                numPoints={5}
                innerRadius={20}
                outerRadius={40}
                fill="#89b717"
                opacity={0.8}
                draggable
                rotation={star.rotation}
                shadowColor="black"
                shadowBlur={10}
                shadowOpacity={0.6}
                shadowOffsetX={star.isDragging ? 10 : 5}
                shadowOffsetY={star.isDragging ? 10 : 5}
                scaleX={star.isDragging ? 1.2 : 1}
                scaleY={star.isDragging ? 1.2 : 1}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
            ))}
          </Layer>
        </Stage>
      </ModalBody>

      <ModalFooter>
        <button type="button" onClick={() => saveButtonClickHandler()}>保存</button>
      </ModalFooter>
    </Modal>
  );
};

export default ImageEditorModal;
