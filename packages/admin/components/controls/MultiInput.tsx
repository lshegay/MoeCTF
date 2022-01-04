import { css } from '@emotion/css';
import { Button, Input, Select, Spacer, useInput } from '@geist-ui/react';
import Plus from '@geist-ui/react-icons/plus';
import React, { useState } from 'react';

type MultiInputProps = {
  initialValue?: string[];
  onChange?: (v: string[]) => void;
};

const MultiInput = ({ initialValue, onChange }: MultiInputProps): JSX.Element => {
  const { state, bindings, reset } = useInput('');
  const [multiInputState, setMultiInputState] = useState({ options: initialValue ?? [] });

  return (
    <>
      <Select
        placeholder="Tags"
        scale={4 / 3}
        multiple
        width="100%"
        disabled
        initialValue={multiInputState.options}
        value={multiInputState.options}
        onChange={(values: string[]): void => {
          setMultiInputState((v) => ({
            ...v,
            options: values,
          }));
          onChange(values);
        }}
      >
        {
          multiInputState.options.map((v) => (
            <Select.Option value={v} key={v}>{v}</Select.Option>
          ))
        }
      </Select>
      <Spacer w={0.5} />
      <div
        className={css(`
          display: flex;
        `)}
      >
        <Input
          width="100%"
          placeholder="new-tag-name"
          scale={0.85}
          {...bindings}
        />
        <Spacer w={0.5} inline />
        <Button
          iconRight={<Plus />}
          auto
          scale={2 / 3}
          px={0.6}
          type="secondary"
          onClick={(): void => {
            const newState = [
              ...multiInputState.options,
              state,
            ];
            setMultiInputState(({
              ...newState,
              options: newState,
            }));
            onChange(newState);
            reset();
          }}
        />
      </div>
    </>
  );
};

export default MultiInput;
