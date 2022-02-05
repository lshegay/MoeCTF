import React, { useEffect } from 'react';
import { useStyletron } from 'baseui';
import { Input, StyledInput, InputProps } from 'baseui/input';
import { Tag, VARIANT as TAG_VARIANT } from 'baseui/tag';

export const InputReplacement = React.forwardRef(
  ({ tags, removeTag, ...restProps }: any, ref) => {
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

type TagInputProps = Omit<InputProps, 'onChage'|'value'> & {
  onChange?: (tags: string[]) => void;
  value: string[];
};

export const TagInput = ({
  placeholder, onChange, value: initialValue, ...props
}: TagInputProps) => {
  const [value, setValue] = React.useState('');
  const [tags, setTags] = React.useState(initialValue);
  const addTag = (tag: string) => {
    setTags([...tags, tag]);
  };
  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
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

  useEffect(() => {
    onChange(tags);
  }, [tags]);

  return (
    <Input
      {...props}
      placeholder={tags.length ? '' : placeholder}
      value={value}
      onChange={(e) => setValue(e.currentTarget.value)}
      overrides={{
        Input: {
          style: { width: 'auto', flexGrow: 1 },
          component: InputReplacement as any,
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
