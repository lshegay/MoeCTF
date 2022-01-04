import React, { useState } from 'react';
import { css } from '@emotion/css';
import {
  Editor as DraftEditor,
  EditorState, RichUtils,
  DefaultDraftBlockRenderMap,
  convertToRaw,
  convertFromRaw,
  DraftHandleValue,
} from 'draft-js';
import Immutable from 'immutable';
import { draftToMarkdown, markdownToDraft } from 'markdown-draft-js';
import 'draft-js/dist/Draft.css';

type EditorProps = {
  editorState: EditorState;
  setEditorState(editorState: EditorState): void;
};

const blockRenderMap = Immutable.Map({
  'code-block': { element: 'code' },
  unstyled: {
    element: 'p',
  },
});

const extendedBlockRenderMap = DefaultDraftBlockRenderMap.merge(blockRenderMap);

const Editor = ({
  editorState,
  setEditorState,
}: EditorProps): JSX.Element => {
  const handleKeyCommand = (command: string, editorState: EditorState): DraftHandleValue => {
    const newState = RichUtils.handleKeyCommand(editorState, command);

    if (newState) {
      setEditorState(newState);
      return 'handled';
    }

    return 'not-handled';
  };

  return (
    <>
      <div
        className={css('font-family: "Merriweather";')}
      >
        <DraftEditor
          editorState={editorState}
          handleKeyCommand={handleKeyCommand}
          onChange={(e: EditorState): void => {
            setEditorState(e);
          }}
          placeholder="Please enter a task's description"
          blockRenderMap={extendedBlockRenderMap}
        />
      </div>
    </>
  );
};

type EditorHook = (m: string) => {
  editorState: EditorState;
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>;
};

const useEditor: EditorHook = (markdownString) => {
  const [editorState, setEditorState] = useState(() => {
    if (markdownString == null) {
      return EditorState.createEmpty();
    }
    const rawData = markdownToDraft(markdownString);
    const contentState = convertFromRaw(rawData);
    const newEditorState = EditorState.createWithContent(contentState);
    return newEditorState;
  });

  return { editorState, setEditorState };
};

const converToString = (editorState: EditorState): string => {
  const currentContent = editorState.getCurrentContent();
  const rawObject = convertToRaw(currentContent);
  const markdownString = draftToMarkdown(rawObject);

  return markdownString;
};

export { useEditor, converToString };

export default Editor;
