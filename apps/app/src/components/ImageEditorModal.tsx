import React, { useEffect, useState } from 'react';

import Konva from 'konva';
import {
  Layer, Stage, Star, Image as KonvaImage,
} from 'react-konva';
import {
  Modal, ModalBody, ModalHeader, ModalFooter,
} from 'reactstrap';

import { useImageEditorModal } from '~/stores/modal';

function generateShapes() {
  return [...Array(10)].map((_, i) => ({
    id: i.toString(),
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    rotation: Math.random() * 180,
    isDragging: false,
  }));
}

const WorkflowModal = (): JSX.Element => {
  const { data: imageEditorModalData, close } = useImageEditorModal();

  const [stars, setStars] = useState(generateShapes());
  const imageRef = React.useRef<Konva.Image | null>(null);
  const [image] = useState(new window.Image());

  useEffect(() => {
    const imageSrc = imageEditorModalData?.imageSrc;

    if (!imageSrc) return;

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
          <Stage width={window.innerWidth} height={window.innerHeight}>
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
          フッター
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default WorkflowModal;
