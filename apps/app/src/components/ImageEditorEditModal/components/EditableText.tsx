import React, {
  useRef, useEffect, useState,
} from 'react';

import Konva from 'konva';
import { Text, Transformer } from 'react-konva';
import { Html, Portal } from 'react-konva-utils';

import { useShapesContext } from '../context';
import { useTransformer } from '../hooks';

const EditableText = ({
  onDragStart,
  onDragEnd,
  onClick,
  onTransform,
  isSelected,
  stage,
  id,
  text,
  ...props
}: {
  onDragStart: (shape: Konva.ShapeConfig) => void;
  onDragEnd: (e: any) => void;
  onTransform: (e: any) => void;
  onClick: (e: any) => void;
  isSelected: boolean;
  stage: Konva.Stage;
  id: string;
  text: string;
  [key: string]: any;
}) => {
  const { focused, setFocused, unfocus } = useShapesContext();

  const shapeRef = useRef<Konva.Text>();
  const textareaRef = useRef<HTMLTextAreaElement>();
  const transformerRef = useRef<Konva.Transformer>();
  const [created, setCreated] = useState<boolean>(false);

  const [divProps, setDivProps] = useState<any>({
    style: {
      display: 'none',
      position: 'absolute',
    },
  });

  const [textareaProps, setTextareaProps] = useState<any>({
    style: {
      display: 'block',
      border: 'none',
      padding: '0px',
      margin: '0px',
      overflow: 'hidden',
      background: 'none',
      outline: 'none',
      resize: 'none',
      height: '',
      fontSize: '',
      lineHeight: '',
      fontFamily: '',
      textAlign: '',
      color: '',
      transform: '',
      transformOrigin: 'left top',
      width: '100%',
      wordBreak: 'keep-all',
    },
  });

  const [originValue, setOriginValue] = useState<string>(text);
  const [textareaValue, setTextareaValue] = useState<string>(originValue);

  const getTextareaWidth = (width) => {
    let newWidth = width;
    if (!newWidth) {
      newWidth = shapeRef.current.text().length * shapeRef.current.fontSize();
    }

    const isSafari = /^((?!chrome|android).)*safari/i.test(
      navigator.userAgent,
    );

    const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    if (isSafari || isFirefox) {
      newWidth = Math.ceil(newWidth);
    }

    const isEdge = /Edge/.test(navigator.userAgent);
    if (isEdge) {
      newWidth += 1;
    }

    return newWidth;
  };

  useTransformer({
    isSelected,
    ref: shapeRef,
    transformer: transformerRef,
  });

  useEffect(() => {
    // 최초 렌더링
    if (!created) {
      setCreated(true);
      return;
    }

    // 포커스가 외부 조건에 의해 해제될 때
    if (focused === null) {
      if (originValue !== textareaValue) {
        onTransform({
          id,
          text: textareaValue,
          width: getTextareaWidth(shapeRef.current.width()),
        });
      }

      setDivProps({
        style: {
          ...divProps.style,
          display: 'none',
        },
      });

      shapeRef.current.show();

      if (isSelected) {
        transformerRef.current.show();
      }
    }
  }, [originValue, textareaValue, focused]);

  function handleTextDblClick(e) {
    shapeRef.current.hide();
    transformerRef.current.hide();

    const textPosition = shapeRef.current.absolutePosition();

    const areaPosition = {
      x: stage.offsetX() + textPosition.x,
      y: stage.offsetY() + textPosition.y,
    };

    const updatedDivProps = {
      ...divProps,
    };

    // 원본 저장
    setOriginValue(textareaValue);

    const updatedTextareaProps = {
      ...textareaProps,
      style: {
        ...textareaProps.style,
      },
    };

    const getTransform = () => {
      const rotation = shapeRef.current.rotation();

      let transform = '';
      if (rotation) {
        transform += `rotateZ(${rotation}deg)`;
      }

      let px = 0;

      const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox')
        > -1;
      if (isFirefox) {
        px += 2 + Math.round(shapeRef.current.fontSize() / 20);
      }

      transform += `translateY(-${px}px)`;

      return transform;
    };

    console.log(shapeRef.current.brightness());

    updatedDivProps.style = {
      ...divProps.style,
      width: `${shapeRef.current.width()
        - shapeRef.current.padding() * 2}px`,
      height: `${shapeRef.current.height()
        - shapeRef.current.padding() * 2 + 5}px`,
      position: 'absolute',
      display: 'block',
      left: `${areaPosition.x}px`,
      top: `${areaPosition.y}px`,
      filter: `brightness(${(shapeRef.current.brightness() + 1)})`,
    };

    updatedTextareaProps.style = {
      ...textareaProps.style,
      fontSize: `${shapeRef.current.fontSize()}px`,
      lineHeight: shapeRef.current.lineHeight(),
      fontFamily: shapeRef.current.fontFamily(),
      textAlign: shapeRef.current.align(),
      color: shapeRef.current.fill(),
      transform: getTransform(),
      height: updatedDivProps.style.height,
    };

    setDivProps(updatedDivProps);
    setTextareaProps(updatedTextareaProps);
    setTextareaValue(shapeRef.current.text());

    textareaRef.current.focus();
  }

  const removeTextarea = () => {
    setDivProps({
      ...divProps,
      style: {
        ...divProps.style,
        display: 'none',
      },
    });
  };

  const onBlurHandler = () => {
    removeTextarea();
    unfocus();
  };

  const onChangeHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    textareaRef.current.style.height = 'auto';

    textareaRef.current.style.height = `${
      textareaRef.current.scrollHeight + shapeRef.current.fontSize()
    }px`;

    console.log(textareaRef.current.style.height);

    setDivProps({
      style: {
        ...divProps.style,
        height: `${
          textareaRef.current.scrollHeight + shapeRef.current.fontSize()
        }px`,
      },
    });

    setTextareaValue(e.target.value);
  };

  useEffect(() => {
    if (!textareaRef.current) {
      return;
    }

    setDivProps({
      style: {
        ...divProps.style,
        height: `${
          textareaRef.current.scrollHeight + shapeRef.current.fontSize()
        }px`,
      },
    });
  }, [textareaValue]);

  return (
    <>
      <Text
        {...props}
        text={text}
        id={id}
        ref={shapeRef}
        onDblClick={(e) => {
          setFocused(id);
          handleTextDblClick(e);
        }}
        onClick={onClick}
        onDragStart={onDragStart}
        onDragEnd={e => onDragEnd(e)}
        onTransform={(e) => {
          const node = shapeRef.current;
          node.setAttrs({
            scaleX: 1,
            width: node.width() * node.scaleX(),
            height: 'auto',
          });
        }}
        onKeyDown={(e) => {
          if (e.keyCode === 13) {
            setFocused(id);
            handleTextDblClick(e);
          }
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();

          // 텍스트는 height: auto를 따라야 하기 때문에 명시적으로 주면 안됨
          node.scaleX(1);
          node.scaleY(1);

          onTransform({
            ...props,
            rotation: node.rotation(),
            x: node.x(),
            y: node.y(),
            width: node.width() * scaleX,
          });
        }}
      />
      {isSelected && (
        <Portal selector=".top-layer" enabled={isSelected}>
          <Transformer
            ref={transformerRef}
            enabledAnchors={['middle-left', 'middle-right']}
            boundBoxFunc={(oldBox, newBox) => {
            // eslint-disable-next-line
            newBox.width = Math.max(30, newBox.width);
              return newBox;
            }}
          />
        </Portal>
      )}
      <Html
        divProps={divProps}
      >
        <textarea
          ref={textareaRef}
          value={textareaValue}
          style={textareaProps.style}
          onChange={onChangeHandler}
          onBlur={() => {
            onBlurHandler();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              // 값 다를 때만 저장
              console.log(originValue);
              console.log(textareaValue);
              if (originValue !== textareaValue) {
                onTransform({
                  id,
                  text: textareaValue,
                  width: getTextareaWidth(shapeRef.current.width()),
                });
              }
              onBlurHandler();

              shapeRef.current.show();
              // 바깥 눌렀을 떄 Selected 해제애햐 앟
              // transformerRef?.current.show();
            }
            // TODO: 나중에 키바인딩 라이브러리 쓰기
            if (e.key === 'ArrowRight') {
              setTextareaProps({
                ...textareaProps,
              });
              setTextareaValue(originValue);
              onBlurHandler();

              shapeRef.current.show();
              // transformerRef.current.show();
            }
          }}
        />
      </Html>

    </>
  );
};

export { EditableText };
