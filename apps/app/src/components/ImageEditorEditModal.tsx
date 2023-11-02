import React, { useEffect, useState, useRef } from 'react';

import Konva from 'konva';
import {
  Layer, Stage, Line, Image as KonvaImage,
} from 'react-konva';
import {
  ModalBody, ModalHeader, ModalFooter,
} from 'reactstrap';

import { apiPostForm } from '~/client/util/apiv1-client';
import { apiv3Get } from '~/client/util/apiv3-client';
import { useImageEditorModal } from '~/stores/modal';
import { useCurrentPageId, useCurrentPagePath } from '~/stores/page';

import {
  EditableText, TransformableCircle, TransformableLine, TransformableRect,
} from './ImageEditorEditModal/components';
import { TransformableImage } from './ImageEditorEditModal/components/TransformableImage';
import { TransformableStamp } from './ImageEditorEditModal/components/TransformableStamp';
import { ShapesContext, ShapesConsumer, useShapesContext } from './ImageEditorEditModal/context';
import {
  useDraggable, useDrawing, useFocusable, useShapes, useStage,
} from './ImageEditorEditModal/hooks';
import { ArrowIcon } from './ImageEditorModalToolsIcon/Arrow';
import { StampIcon } from './ImageEditorModalToolsIcon/Stamp';
import { TextIcon } from './ImageEditorModalToolsIcon/Text';
import { TrimingIcon } from './ImageEditorModalToolsIcon/Triming';

const MAX_WIDTH = 800;

type Attachment = {
  attachment: {
    tag: string;
    filePathProxied: string;
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

export const Tools = {
  Arrow: 'arrow',
  Text: 'text',
  Triming: 'triming',
  Pen: 'pen',
  Stamp: 'stamp',
  Rectangle: 'rectangle',
} as const;

const ToolsArray = Object.keys(Tools);

export type Tools = typeof ToolsArray[keyof typeof ToolsArray];

type Props = {
  onClickTransitionHistoryButton: () => void;
  selectedAttachmentId: string | null;
  setSelectedAttachmentId: (id: string | null) => void;
  cleanupModal: () => void;
};

export const ImageEditorEditModal = (props: Props): JSX.Element => {
  const {
    onClickTransitionHistoryButton, selectedAttachmentId, setSelectedAttachmentId, cleanupModal,
  } = props;

  const { data: currentPageId } = useCurrentPageId();
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: imageEditorModalData } = useImageEditorModal();

  const currentAttachmentId = imageEditorModalData?.imageSrc?.replace('/attachment/', '');

  const [image] = useState(new window.Image());
  const [imageWidth, setImageWidth] = useState<number>(image.naturalWidth);
  const [imageHeight, setImageHeight] = useState<number>(image.naturalHeight);
  const [attachment, setAttachment] = useState<Attachment | null>(null);

  const [tool, setTool] = useState<Tools | null>(null);

  const [lines, setLines] = useState<any>([]);
  const isDrawing = React.useRef(false);

  const imageRef = useRef<Konva.Image | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);

  const {
    zoom,
    mode,
  } = useShapesContext();

  const {
    stage,
    setStage,
    layer,
    setLayer,
  } = useStage();

  const {
    addShape, updateShape, setShapes, shapes,
  } = useShapes();

  const {
    selected, onDragStart, onDragEnd, unselect, setSelected,
    draggable, setDraggable,
  } = useDraggable({
    updateShape,
  });

  const {
    onDrawStart,
    onDrawing,
    onDrawEnd,
    points,
    willDrawing, setWillDrawing, drawing,
  } = useDrawing({
    addShape, setSelected,
  });

  const {
    unfocus,
  } = useFocusable();

  useEffect(() => {
    if (stageRef.current && !stage) {
      setStage(stageRef.current);
    }
    if (layerRef.current && !layer) {
      setLayer(layerRef.current);
    }
  }, [layer, stage, stageRef, layerRef, setLayer, setStage]);

  useEffect(() => {
    setShapes([]);
  }, []);

  const saveButtonClickHandler = async() => {
    if (stage == null || currentPageId == null || currentPagePath == null) {
      return;
    }

    try {
      const blob = await stage.toBlob({
        width: imageWidth, height: imageHeight, mimeType: 'image/jpeg',
      }) as any;

      const formData = new FormData();
      const file = new File([blob], 'example.jpeg', { type: blob.type });

      formData.append('file', file);
      formData.append('page_id', currentPageId);
      formData.append('path', currentPagePath);

      if (attachment !== null && attachment.attachment.tag !== null) {
        formData.append('tag', attachment.attachment.tag);
      }

      const res = await apiPostForm('/attachments.add', formData) as any;
      const editedImagePath = res.attachment.filePathProxied;

      if (imageEditorModalData?.onSave != null) {
        imageEditorModalData?.onSave(editedImagePath);
        setSelectedAttachmentId(editedImagePath.replace('/attachment/', ''));
      }

      cleanupModal();
    }
    catch (err) {
      // TODO: Error handling
    }
  };

  const handleAddShape = (configs: {[key: string]: any}) => {
    const [shape] = addShape<Konva.ShapeConfig>({ ...configs });
    setSelected(shape.id);
  };

  useEffect(() => {
    const imageSrc = attachment?.attachment?.filePathProxied;

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
  }, [image, attachment]);

  useEffect(() => {
    const targetAttachmentId = selectedAttachmentId || currentAttachmentId;

    if (targetAttachmentId == null) {
      return;
    }

    apiv3Get(`/attachment?attachmentId=${targetAttachmentId}`)
      .then((response) => {
        setAttachment(response.data);
      })
      .catch((error) => {
        console.error(error);
      });

  }, [selectedAttachmentId, currentAttachmentId]);

  return (
    <>
      <ModalHeader className="bg-primary text-light">
        画像編集
      </ModalHeader>

      <div className="my-2 ml-3 d-flex">
        <button type="button" className={`btn mr-1 ${tool === Tools.Arrow ? 'btn-light' : ''} `}>
          <ArrowIcon /> 矢印
        </button>
        <button
          type="button"
          onClick={() => {
            setTool(Tools.Text);
            handleAddShape({ type: 'text' });
          }}
          className={`btn mr-1 ${tool === Tools.Text ? 'btn-light' : ''} `}
        >
          <TextIcon /> 文字
        </button>
        <button
          type="button"
          onClick={() => {
            setTool(Tools.Rectangle);
            handleAddShape({ type: 'rectangle' });
          }}
          className={`btn mr-1 ${tool === Tools.Rectangle ? 'btn-light' : ''} `}
        >
          <i className="icon-fw icon-loop" /> 四角
        </button>
        <button type="button" className={`btn mr-1 ${tool === Tools.Triming ? 'btn-light' : ''} `}>
          <TrimingIcon /> トリミング
        </button>
        <button
          type="button"
          onClick={() => {
            setTool(Tools.Pen);
            unselect();
            unfocus();
            setWillDrawing(true);
          }}
          className={`btn mr-1 ${tool === Tools.Pen ? 'btn-light' : ''} `}
        >
          <i className="icon-fw icon-pencil" /> ペン
        </button>
        <button
          type="button"
          onClick={() => {
            setTool(Tools.Stamp);
            handleAddShape({ type: 'stamp' });
          }}
          className={`btn mr-1 ${tool === Tools.Stamp ? 'btn-light' : ''} `}
        >
          <StampIcon /> スタンプ
        </button>
        <div className="ml-auto">
          <button type="button" className="btn btn-outline-secondary mr-3" onClick={() => onClickTransitionHistoryButton()}>編集履歴</button>
        </div>
      </div>

      <ModalBody className="mx-auto">
        <ShapesConsumer>
          {value => (
          // TODO: 키보드 이벤트 리스닝하게 하기
            <Stage
              ref={stageRef}
              // TODO: 캔버스 크기를 이미지 기반으로 조절 가능하게
              width={imageWidth}
              height={imageHeight}
              onMouseDown={(e) => {
                if (willDrawing) {
                  setDraggable(false);
                  onDrawStart(e);
                }
                else {
                  unselect(e);
                  unfocus(e);
                }
              }}
              onMouseMove={(e) => {
                if (drawing) {
                  onDrawing(e);
                  unselect(e);
                  unfocus(e);
                }
              }}
              onMouseUp={(e) => {
                if (drawing) {
                  onDrawEnd(e);
                  setDraggable(true);
                }
              }}
              scaleX={1}
              scaleY={1}
              onTouchStart={unselect}
              style={{
                cursor: willDrawing || drawing ? 'crosshair' : 'default',
                display: 'inline-block',
                backgroundColor: 'white',
                verticalAlign: 'middle',
              }}
            >
              <ShapesContext.Provider value={value}>
                <Layer>
                  <KonvaImage image={image} ref={imageRef} width={imageWidth} height={imageHeight} onClick={() => setSelected(null)} />
                </Layer>
                <Layer ref={layerRef}>
                  {shapes.map((shape) => {
                    switch (shape.type) {
                      case 'rectangle':
                        return (
                          <TransformableRect
                            {...shape}
                            draggable={draggable}
                            key={shape.id}
                            isSelected={selected === shape.id}
                            onDragStart={e => onDragStart(e, shape)}
                            onDragEnd={e => onDragEnd(e)}
                            onClick={() => setSelected(shape.id)}
                            onTransform={updated => updateShape({
                              ...updated,
                              id: shape.id,
                            })}
                          />
                        );
                      case 'stamp':
                        return (
                          <TransformableStamp
                            {...shape}
                            draggable={draggable}
                            key={shape.id}
                            maxWidth={imageWidth}
                            isSelected={selected === shape.id}
                            onDragStart={e => onDragStart(e, shape)}
                            onDragEnd={e => onDragEnd(e)}
                            onClick={() => setSelected(shape.id)}
                            onTransform={updated => updateShape({
                              ...updated,
                              id: shape.id,
                            })}
                          />
                        );
                      case 'ellipse':
                        return (
                          <TransformableCircle
                            {...shape}
                            draggable={draggable}
                            key={shape.id}
                            radiusX={shape.radiusX}
                            radiusY={shape.radiusY}
                            isSelected={selected === shape.id}
                            onClick={() => setSelected(shape.id)}
                            onDragStart={e => onDragStart(e, shape)}
                            onDragEnd={e => onDragEnd(e)}
                            onTransform={updated => updateShape({
                              ...updated,
                              id: shape.id,
                            })}
                          />
                        );
                      case 'line':
                        return (
                          <TransformableLine
                            {...shape}
                            draggable={draggable}
                            key={shape.id!}
                            mode={shape.mode}
                            points={shape.points}
                            isSelected={selected === shape.id}
                            onDragStart={e => onDragStart(e, shape)}
                            onDragEnd={e => onDragEnd(e)}
                            onClick={() => setSelected(shape.id)}
                            onTransform={updated => updateShape({
                              ...updated,
                              id: shape.id,
                            })}
                          />
                        );
                      case 'text':
                        return (
                          <EditableText
                            {...shape}
                            draggable={draggable}
                            id={shape.id}
                            key={shape.id}
                            text={shape.text}
                            stage={stageRef.current}
                            isSelected={selected === shape.id}
                            onDragStart={e => onDragStart(e, shape)}
                            onDragEnd={e => onDragEnd(e)}
                            onClick={() => setSelected(shape.id)}
                            onTransform={updated => updateShape({
                              ...updated,
                              id: shape.id,
                            })}
                          />
                        );
                      default:
                        return null;
                    }
                  })}

                  {drawing && points.length > 0 ? (
                    <TransformableLine
                      mode={mode}
                      points={points}
                      isSelected={false}
                      onDragStart={() => {}}
                      onDragEnd={() => {}}
                      onClick={() => {}}
                      onTransform={() => {}}
                      stroke="#df4b26"
                    />
                  )
                    : null}
                </Layer>
              </ShapesContext.Provider>
            </Stage>
          )}
        </ShapesConsumer>
      </ModalBody>

      <ModalFooter>
        <button type="button" className="btn btn-outline-secondary mr-2" onClick={() => cleanupModal()}>キャンセル</button>
        <button type="button" className="btn btn-primary mr-2" onClick={() => saveButtonClickHandler()}>保存</button>
      </ModalFooter>
    </>
  );
};
