import React, { useEffect, useState, useRef } from 'react';

import Konva from 'konva';
import {
  Layer, Stage, Line, Image as KonvaImage,
} from 'react-konva';
import {
  Modal, ModalBody, ModalHeader, ModalFooter,
} from 'reactstrap';

import { apiPostForm } from '~/client/util/apiv1-client';
import { useImageEditorModal } from '~/stores/modal';
import { useCurrentPageId, useCurrentPagePath } from '~/stores/page';


const MAX_WIDTH = 800;

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

export const Tools = {
  Pen: 'pen',
} as const;

const ToolsArray = Object.keys(Tools);

export type Tools = typeof ToolsArray[keyof typeof ToolsArray];


const ImageEditorModal = (): JSX.Element => {
  const { data: imageEditorModalData, close: closeImageEditorModal } = useImageEditorModal();
  const { data: currentPageId } = useCurrentPageId();
  const { data: currentPagePath } = useCurrentPagePath();

  const [image] = useState(new window.Image());
  const [imageWidth, setImageWidth] = useState<number>(image.naturalWidth);
  const [imageHeight, setImageHeight] = useState<number>(image.naturalHeight);

  const [tool, setTool] = useState<Tools | null>(Tools.Pen);

  const [lines, setLines] = useState<any>([]);
  const isDrawing = React.useRef(false);

  const imageRef = useRef<Konva.Image | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);


  const handleMouseDown = (event: Konva.KonvaEventObject<MouseEvent>) => {
    if (event == null) {
      return;
    }

    isDrawing.current = true;
    const pos = event.target.getStage()?.getPointerPosition();
    setLines([...lines, { tool, points: [pos?.x, pos?.y] }]);
  };

  const handleMouseMove = (event: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing.current || event == null) {
      return;
    }
    const pos = event.target.getStage()?.getPointerPosition();

    const lastLine = lines[lines.length - 1];
    // add point
    lastLine.points = lastLine.points.concat([pos?.x, pos?.y]);

    // replace last
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
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

      const attachmentId = getAttachmentId(imageEditorModalData?.imageSrc);
      if (attachmentId != null) {
        formData.append('parent', attachmentId);
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
        <Stage ref={stageRef} width={imageWidth} height={imageHeight} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
          <Layer>
            <KonvaImage image={image} ref={imageRef} width={imageWidth} height={imageHeight} />

            {/* see: https://konvajs.org/docs/react/Free_Drawing.html */}
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke="#df4b26"
                strokeWidth={5}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                  line.tool === 'eraser' ? 'destination-out' : 'source-over'
                }
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
