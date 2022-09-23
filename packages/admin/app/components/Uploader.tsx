import React, { useState } from 'react';
import { FileUploader, FileUploaderProps, StyleProps } from 'baseui/file-uploader';
import { LabelMedium } from 'baseui/typography';

type UploaderProps = Omit<FileUploaderProps, 'onChange' | 'value'> & {
  onChange?: (file: File) => void;
  value?: File;
};

const ContentMessage: React.ComponentType<StyleProps> = (
  ({ value }: StyleProps & { value: File }) => (
    <LabelMedium>{value?.name ? `Uploaded: ${value.name}` : 'Drop files here to Upload'}</LabelMedium>
  )
);

// eslint-disable-next-line import/prefer-default-export
export const Uploader = ({ onChange, value: initialValue, ...props }: UploaderProps) => {
  const [value, setValue] = useState(initialValue);

  return (
    <FileUploader
      {...props}
      multiple={false}
      onDrop={(files) => {
        if (files.length == 1) {
          const file = files[0];

          onChange(file);
          setValue(file);
        }
      }}
      overrides={{
        ContentMessage: { component: ContentMessage, props: { value } },
      }}
    />
  );
};
