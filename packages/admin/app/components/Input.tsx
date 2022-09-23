import React, { useEffect } from 'react';
import { useStyletron } from 'baseui';
import { Input, StyledInput, InputProps, SharedProps } from 'baseui/input';
import { Tag, VARIANT as TAG_VARIANT } from 'baseui/tag';
import { StyletronComponentInjectedProps } from 'styletron-react';

type InputReplacementProps = SharedProps & StyletronComponentInjectedProps<undefined>
& { tags: string[]; removeTag: (tag: string) => void };

export const InputReplacement: React.ComponentType<InputReplacementProps> = React.forwardRef(
  ({ tags, removeTag, ...restProps }: InputReplacementProps, ref) => {
    const [css] = useStyletron();
    return (
      <div
        className={css({
          flex: '1 1 0%',
          flexWrap: 'wrap',
          display: 'flex',
          alignItems: 'center',
        })}
      >
        {tags.map((tag: string) => (
          <Tag
            variant={TAG_VARIANT.solid}
            onActionClick={() => removeTag(tag)}
            key={tag}
          >
            {tag}
          </Tag>
        ))}
        <StyledInput ref={ref} {...restProps} />
      </div>
    );
  },
);

type TagInputProps = Omit<InputProps, 'onChage' | 'value'> & {
  onChange?: (tags: string[]) => void;
  value: string[];
};

export const TagInput = ({
  placeholder, onChange, value: initialValue, ...props
}: TagInputProps) => {
  const [value, setValue] = React.useState('');
  const [tags, setTags] = React.useState(initialValue);
  const addTag = (tag: string) => {
    if (tags.some((tagName) => tag == tagName)) return;

    setTags([...tags, tag]);
    if (onChange) {
      onChange(tags);
    }
  };
  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t != tag));
    if (onChange) {
      onChange(tags);
    }
  };
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    switch (event.key) {
      case 'Enter': {
        if (!value) break;
        addTag(value);
        setValue('');
        break;
      }
      case 'Backspace': {
        if (value || !tags.length) break;
        removeTag(tags[tags.length - 1]);
        break;
      }
    }
  };

  return (
    <Input
      {...props}
      placeholder={tags.length ? '' : placeholder}
      value={value}
      onChange={(e) => setValue(e.currentTarget.value)}
      overrides={{
        Input: {
          style: { width: 'auto', flexGrow: 1 },
          component: InputReplacement,
          props: {
            tags,
            removeTag,
            onKeyDown: handleKeyDown,
          },
        },
      }}
    />
  );
};
