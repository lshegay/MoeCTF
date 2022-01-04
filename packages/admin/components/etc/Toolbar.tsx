import React, { useMemo } from 'react';
import { css } from '@emotion/css';
import { EditorState, RichUtils } from 'draft-js';

import {
  Bold,
  Italic,
  Icon,
  Divider,
  List,
  Code,
  MessageCircle,
} from '@geist-ui/react-icons';
import 'draft-js/dist/Draft.css';
import { Button, Select, Tooltip } from '@geist-ui/react';

type ToolbarProps = {
  editorState: EditorState;
  setEditorState(editorState: EditorState): void;
};

type InlineStyle = {
  label?: string;
  icon?: Icon;
  value?: string;
  type?: 'style' | 'block' | 'divider';
};

const inlineStyles: InlineStyle[] = [
  { type: 'divider' },
  {
    label: 'Bold',
    value: 'BOLD',
    type: 'style',
    icon: Bold,
  },
  {
    label: 'Italic',
    value: 'ITALIC',
    type: 'style',
    icon: Italic,
  },
  { type: 'divider' },
  {
    label: 'Ordered List',
    value: 'ordered-list-item',
    type: 'block',
    icon: List,
  },
  {
    label: 'Un-Ordered List',
    value: 'unordered-list-item',
    type: 'block',
    icon: List,
  },
  { type: 'divider' },
  {
    label: 'Code',
    value: 'CODE',
    type: 'style',
    icon: Code,
  },
  {
    label: 'Blockquote',
    value: 'blockquote',
    type: 'block',
    icon: MessageCircle,
  },
];

const blockStyles: InlineStyle[] = [
  {
    label: 'Paragraph',
    value: 'unstyled',
  },
  ...['one', 'two', 'three', 'four', 'five', 'six'].map((n, i) => ({
    label: `Heading ${i + 1}`,
    value: `header-${n}`,
  })),
];

const Toolbar = ({ editorState, setEditorState }: ToolbarProps): JSX.Element => {
  const currentBlockType = useMemo(() => RichUtils.getCurrentBlockType(editorState), [editorState]);

  const applyStyle = (style: InlineStyle): void => {
    if (style.type == 'style') {
      setEditorState(RichUtils.toggleInlineStyle(editorState, style.value));
    }
    if (style.type == 'block') {
      setEditorState(RichUtils.toggleBlockType(editorState, style.value));
    }
  };

  const isActive = (style: InlineStyle): boolean => {
    if (style.type == 'style') {
      const currentInlineStyle = editorState.getCurrentInlineStyle();
      return currentInlineStyle.has(style.value);
    }

    if (style.type == 'block') {
      return RichUtils.getCurrentBlockType(editorState) == style.value;
    }
    return false;
  };

  return (
    <>
      <div>
        <Select
          placeholder="Choose one"
          value={currentBlockType}
          onChange={(value: string): void => (
            setEditorState(RichUtils.toggleBlockType(editorState, value))
          )}
        >
          {blockStyles.map((style) => (
            <Select.Option value={style.value} key={style.value}>{style.label}</Select.Option>
          ))}
        </Select>
        {inlineStyles.map((style, i) => (
          style.type == 'divider'
            ? (
              // eslint-disable-next-line react/no-array-index-key
              <Divider key={`${style.type}${i}`} size="15px" className={css('margin: 0 20px 0 15px;')} />
            )
            : (
              <Tooltip type="dark" text={style.label} key={style.value}>
                <Button
                  auto
                  onClick={(): void => applyStyle(style)}
                  scale={2 / 3}
                  px={0.6}
                  iconRight={<style.icon />}
                  className={css(`
                    &:hover {
                      background-color: #e9effd !important;
                    }

                    border-width: 0 !important;
                    margin-right: 5px !important;
                    ${isActive(style) ? 'background-color: #e9effd !important;' : ''}
                  `)}
                />
              </Tooltip>
            )
        ))}
      </div>
    </>
  );
};

export default Toolbar;
