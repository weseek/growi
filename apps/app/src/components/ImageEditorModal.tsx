import React, { useEffect, useState, useRef } from 'react';

import Konva from 'konva';
import {
  Layer, Stage, Star, Image as KonvaImage,
} from 'react-konva';
import {
  Modal, ModalBody, ModalHeader, ModalFooter,
} from 'reactstrap';

import { apiPostForm } from '~/client/util/apiv1-client';
import { useImageEditorModal } from '~/stores/modal';
import { useCurrentPageId, useCurrentPagePath } from '~/stores/page';

function generateShapes() {
  return [...Array(10)].map((_, i) => ({
    id: i.toString(),
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    rotation: Math.random() * 180,
    isDragging: false,
  }));
}

const convertBase64ToBlob = async(base64Image: string): Promise<Blob> => {
  const base64Response = await fetch(base64Image);
  return base64Response.blob();
};

const ImageEditorModal = (): JSX.Element => {
  const { data: imageEditorModalData, close } = useImageEditorModal();
  const { data: currentPageId } = useCurrentPageId();
  const { data: currentPagePath } = useCurrentPagePath();

  const [stars, setStars] = useState(generateShapes());
  const imageRef = React.useRef<Konva.Image | null>(null);
  const [image] = useState(new window.Image());

  const stageRef = useRef<Konva.Stage>(null);

  useEffect(() => {
    const imageSrc = imageEditorModalData?.imageSrc;

    if (imageSrc == null) return;

    image.src = imageSrc;
    image.onload = () => {
      if (imageRef.current) {
        const layer = imageRef.current.getLayer();
        if (layer) {
          layer.batchDraw();
        }
      }
    };
  }, [image, imageEditorModalData]);

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

  const saveImage = async() => {
    const temp = stageRef.current;

    if (temp == null || currentPageId == null || currentPagePath == null) {
      return;
    }

    const base64data = temp.toDataURL({});
    const blobData = await convertBase64ToBlob(base64data);
    const formData = new FormData();

    formData.append('file', blobData, 'filename.png');
    formData.append('page_id', currentPageId);
    formData.append('path', currentPagePath);

    try {
      await apiPostForm('/attachments.add', formData);
    }
    catch (err) {
      //
    }
  };

  if (imageEditorModalData?.imageSrc == null) {
    return <></>;
  }

  return (
    <div>
      <Modal isOpen={imageEditorModalData?.isOpened ?? false} toggle={() => close()}>
        <ModalHeader>
          ヘッダー
        </ModalHeader>

        <ModalBody>
          <Stage ref={stageRef} width={window.innerWidth} height={window.innerHeight}>
            <Layer>
              <KonvaImage image={image} ref={imageRef} />

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
          <button type="button" onClick={() => saveImage()}>保存</button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ImageEditorModal;
