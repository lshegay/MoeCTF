import React, { useRef } from 'react';
import { Button, Text, Input, Spacer, useToasts, Link, useModal, Modal } from '@geist-ui/react';
import IconPaperclip from '@geist-ui/react-icons/paperclip';
import { useRouter } from 'next/router';
import { css } from '@emotion/css';
import isEmpty from 'lodash/isEmpty';
import { Form, Formik, FormikErrors } from 'formik';
import { EditorState } from 'draft-js';
import { Task } from '@models/units';
import { Response } from '@utils/response';
import { converToString } from '@components/etc/Editor';
import MultiInput from '@components/controls/MultiInput';
import { Overwrite } from '@utils/types';
import 'whatwg-fetch';

type TaskFormProps = {
  task: Partial<Task>;
  minPoints: number;
  maxPoints: number;
  editorState: EditorState;
};

type TaskFormUnit = Overwrite<Partial<Task>, {
  points: string;
  file?: File | string;
}>;

const LabelStyle = css(`
  text-transform: uppercase;
  color: #666666 !important;
  margin-bottom: 6px;
`);
const ErrorStyle = css(`
  margin: 5px 0 10px;
`);

const formValidate = (minPoints: number, maxPoints: number, isTask: boolean) => (
  (values: TaskFormUnit): FormikErrors<TaskFormUnit> => {
    const errors: FormikErrors<TaskFormUnit> = {};

    if (isEmpty(values.name)) {
      errors.name = 'Please provide a task name.';
    }

    const points = parseInt(values.points, 10);

    if (!Number.isInteger(points)) {
      errors.points = 'Please provide a score.';
    }
    if (points < minPoints || points > maxPoints) {
      errors.points = `Score should be between ${minPoints} and ${maxPoints}.`;
    }

    if ((isEmpty(values.flag)) && !isTask) {
      errors.flag = 'Please provide a flag.';
    }

    return errors;
  }
);

const TaskForm = ({
  task,
  minPoints,
  maxPoints,
  editorState,
}: TaskFormProps): JSX.Element => {
  const ref = useRef(null);
  const router = useRouter();
  const isTask = !!task._id;
  const [, setToast] = useToasts();
  const { setVisible, bindings } = useModal();

  return (
    <>
      <Formik
        initialValues={{
          name: task.name,
          points: task.points?.toString(),
          flag: task.flag,
          file: task.file,
          content: task.content,
          tags: task.tags,
        }}
        validate={formValidate(minPoints, maxPoints, isTask)}
        onSubmit={async (values, { setSubmitting, setErrors, setFieldValue }): Promise<void> => {
          const content = converToString(editorState);

          const form = new FormData();
          Object.keys(values).forEach((key) => (
            !isEmpty(values[key]) && form.append(key, values[key])
          ));
          form.set('content', content);
          form.set('tags', JSON.stringify(values.tags));

          if (typeof values.file == 'string') {
            form.set('file', null);
          }

          if (isTask) {
            const res = await window.fetch(`/api/admin/tasks/${task._id}`, {
              method: 'PUT',
              body: form,
            });

            const response: Response<{ task: FormikErrors<TaskFormUnit> }> = await res.json();
            if (response.status == 'success') {
              setToast({ text: 'Task has been updated.', type: 'success' });
              return;
            }

            setErrors(response.data.task);
            setToast({ text: 'Something wrong has happened. Nothing was changed.', type: 'error' });
          } else {
            const res = await window.fetch('/api/admin/tasks', {
              method: 'POST',
              body: form,
            });

            const response: Response<{ task: FormikErrors<TaskFormUnit> }> = await res.json();
            if (response.status == 'success') {
              setToast({ text: 'Task has been created.', type: 'success' });
              await router.push(`/admin/editor?tid=${response.data.task._id}`);

              setFieldValue('file', response.data.task.file);
              return;
            }

            setErrors(response.data.task);
            setToast({ text: 'Something wrong has happened. Nothing was changed.', type: 'error' });
          }

          setSubmitting(false);
        }}
      >
        {({
          errors,
          submitForm,
          isSubmitting,
          handleChange,
          setFieldValue,
          values,
        }): JSX.Element => (
          <Form className={css('display: flex; flex-direction: column;')}>
            <Text span b font="12px" className={LabelStyle}>Task name</Text>
            <Input
              scale={4 / 3}
              width="100%"
              placeholder="task-name"
              name="name"
              onChange={handleChange}
              initialValue={values.name}
            />
            <Text span type="error" font="14px" className={ErrorStyle}>{errors?.name}</Text>
            <Text span b font="12px" className={LabelStyle}>Points</Text>
            <Input
              scale={4 / 3}
              min={minPoints}
              max={maxPoints}
              name="points"
              htmlType="number"
              width="100%"
              placeholder="500"
              onChange={handleChange}
              initialValue={values.points}
            />
            <Text span type="error" font="14px" className={ErrorStyle}>{errors?.points}</Text>
            <Text span b font="12px" className={LabelStyle}>Tags</Text>
            <MultiInput initialValue={values.tags} onChange={(tags): void => { setFieldValue('tags', tags); }} />
            <Text span type="error" font="14px" className={ErrorStyle}>{errors?.tags}</Text>
            <Text span b font="12px" className={LabelStyle}>Flag</Text>
            <Input
              scale={4 / 3}
              name="flag"
              width="100%"
              placeholder="CTF{your-moe-flag}"
              onChange={handleChange}
            />
            <Text span type="error" font="14px" className={ErrorStyle}>{errors?.flag}</Text>
            <div className={css('display: flex; flex-direction: column; margin: 15px 0;')}>
              <input
                ref={ref}
                name="file"
                type="file"
                className={css('display: none;')}
                onChange={(event): void => {
                  setFieldValue('file', event.currentTarget.files[0]);
                }}
              />
              <Button onClick={(): void => ref.current.click()}>
                <IconPaperclip />
                <Spacer inline w={0.35} />
                Attach File
              </Button>
              <Text span type="secondary" font="14px" className={ErrorStyle}>
                {
                  typeof values.file != 'string'
                    ? values.file?.name && `Attachment: ${values.file.name}`
                    : values.file && (
                      <>
                        {'Attachment: '}
                        <Link href={values.file} target="_blank" underline color>{values.file.split('/').pop()}</Link>
                      </>
                    )
                }
              </Text>
            </div>
            <Button type="secondary" onClick={submitForm} loading={isSubmitting} shadow>
              {isTask ? 'Update Task' : 'Add Task'}
            </Button>
            {isTask && (
              <>
                <Spacer h={1} />
                <Button
                  type="error"
                  shadow
                  onClick={(): void => setVisible(true)}
                >
                  Delete Task
                </Button>
              </>
            )}
          </Form>
        )}
      </Formik>
      <Modal {...bindings}>
        <Modal.Title>Are you sure?</Modal.Title>
        <Modal.Subtitle>Delete Task</Modal.Subtitle>
        <Modal.Content className={css('text-align: center !important;')}>
          <p>You want to delete this task? Сhanges are irreversible!</p>
        </Modal.Content>
        <Modal.Action passive onClick={(): void => setVisible(false)}>Cancel</Modal.Action>
        <Modal.Action
          onClick={async (): Promise<void> => {
            setVisible(false);
            const res = await window.fetch(`/api/admin/tasks/${task._id}`, {
              method: 'DELETE',
            });

            const response: Response<{ task: FormikErrors<TaskFormUnit> }> = await res.json();

            if (response.status == 'success') {
              setTimeout(() => router.push('/admin'), 2000);
              setToast({ text: 'Task has been deleted.', type: 'success' });
              return;
            }

            setToast({ text: 'Something wrong has happened.', type: 'error' });
          }}
        >
          Delete, please!
        </Modal.Action>
      </Modal>
    </>
  );
};

export default TaskForm;
