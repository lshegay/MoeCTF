/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { useRouter } from 'next/router';
import Header from '@app/components/Header';
import routes, { useProfile, useTask } from '@utils/routes';
import { Container, FullscreenBlock, FullscreenLoader } from '@components/DefaultBlocks';
import { useStyletron } from 'baseui';
import { Skeleton } from 'baseui/skeleton';
import { Block } from 'baseui/block';
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid';
import { HeadingLarge } from 'baseui/typography';
import { Check, Delete } from 'baseui/icon';
import { Textarea } from 'baseui/textarea';
import { Formik, FormikErrors } from 'formik';
import { FormControl } from 'baseui/form-control';
import { Input } from 'baseui/input';
import { TagInput } from '@app/components/Input';
import { Button } from 'baseui/button';
import { Uploader } from '@app/components/Uploader';
import { useSnackbar, DURATION } from 'baseui/snackbar';
import { Response, Status } from 'moectf-core/response';
import request from 'moectf-core/request';

type TaskFormValues = {
  name?: string;
  flag?: string;
  points?: number;
  tags?: string[];
  file?: File;
  content?: string;
};

type TaskFormErrors = { [Property in keyof TaskFormValues]: string };

type TaskFormResponse = Response<TaskFormErrors>;

const formValidate = (values: TaskFormValues) => {
  const errors: Partial<FormikErrors<TaskFormValues>> = {};

  if (values.name == '') {
    errors.name = 'Please provide a user name.';
  }

  if (!values.points) {
    errors.points = 'Please provide points.';
  }

  return errors;
};

const Page = () => {
  const router = useRouter();
  const tid = router.query.tid as string;

  const { user, isValidating } = useProfile();
  const { task, isValidating: taskValidating } = useTask(tid);
  const [, { colors }] = useStyletron();
  const { enqueue, dequeue } = useSnackbar();

  if (!user && !isValidating) {
    router.push('/login')
      .catch((e) => console.error(e));
    return (<FullscreenLoader />);
  }

  if (!user && isValidating) {
    return (<FullscreenLoader />);
  }

  if (!task && !taskValidating) {
    router.push('/')
      .catch((e) => console.error(e));
    return (<FullscreenLoader />);
  }

  return (
    <FullscreenBlock display="flex" flexDirection="column">
      <Header
        user={user}
        title="Task Info"
        description="There you can edit your task. Just be sure that
            this task has a good description and deserves enough points.
            Good luck!"
      />
      <Block
        backgroundColor={colors.backgroundSecondary}
        className="grow"
        padding="70px 0"
      >
        <Container>
          {taskValidating ? (
            <Skeleton width="100%" height="500px" />
          ) : (
            <Block
              backgroundColor={colors.backgroundPrimary}
              className="px-10 py-8 shadow-2xl"
            >
              <HeadingLarge className="mb-10">Edit Data</HeadingLarge>
              <Formik
                initialValues={{
                  name: task.name,
                  content: task.content,
                  flag: '',
                  points: task.points,
                  tags: task.tags,
                  file: task.file ? new File([], task.file) : null,
                }}
                validate={formValidate}
                onSubmit={async (values, { setSubmitting, setErrors }) => {
                  const formData = request.convert(values);
                  enqueue({ message: 'Making Changes', progress: true }, DURATION.infinite);

                  const response = await (await fetch(routes.taskPut.replace(':_id', tid), {
                    body: formData,
                    credentials: 'include',
                    method: 'PUT',
                  })).json() as TaskFormResponse;

                  dequeue();
                  if (response.status == Status.SUCCESS) {
                    enqueue({
                      message: 'Changes were made successfully',
                      startEnhancer: ({ size }) => (<Check size={size} />),
                    }, DURATION.short);
                  } else {
                    setErrors(response.data);
                  }

                  setSubmitting(false);
                }}
              >
                {({
                  values,
                  errors,
                  setFieldValue,
                  submitForm,
                  isSubmitting,
                  handleChange,
                }) => (
                  <Block>
                    <FlexGrid
                      flexGridColumnCount={[1, 1, 2]}
                      flexGridColumnGap="20px"
                    >
                      <FlexGridItem>
                        <FormControl label="Name" error={errors.name}>
                          <Input name="name" value={values.name} onChange={handleChange} />
                        </FormControl>
                      </FlexGridItem>
                      <FlexGridItem>
                        <FormControl label="Flag" error={errors.flag}>
                          <Input name="flag" value={values.flag} onChange={handleChange} />
                        </FormControl>
                      </FlexGridItem>
                      <FlexGridItem>
                        <FormControl label="Content" error={errors.content}>
                          <Textarea name="content" value={values.content} onChange={handleChange} />
                        </FormControl>
                      </FlexGridItem>
                      <FlexGridItem>
                        <FormControl label="Points" error={errors.points}>
                          <Input name="points" type="number" value={values.points} onChange={handleChange} />
                        </FormControl>
                      </FlexGridItem>
                      <FlexGridItem>
                        <FormControl label="Tags" error={errors.tags}>
                          <TagInput name="tags" value={values.tags} onChange={(tags) => setFieldValue('tags', tags)} />
                        </FormControl>
                      </FlexGridItem>
                      <FlexGridItem>
                        <FormControl label="File" error={errors.file}>
                          <Uploader name="file" value={values.file} onChange={(file) => setFieldValue('file', file)} />
                        </FormControl>
                      </FlexGridItem>
                    </FlexGrid>
                    <Block className="flex" justifyContent="flex-end">
                      <Block className="mr-5">
                        <Button
                          kind="secondary"
                          onClick={async () => {
                            enqueue({ message: 'Making Changes', progress: true }, DURATION.infinite);
                            const response = await (await fetch(routes.taskDelete.replace(':_id', tid), {
                              credentials: 'include',
                              method: 'DELETE',
                            })).json() as Response<unknown>;

                            dequeue();
                            if (response.status == Status.SUCCESS) {
                              enqueue({
                                message: 'Task was deleted successfully',
                                startEnhancer: ({ size }) => (<Check size={size} />),
                              }, DURATION.short);
                              router.push('/')
                                .catch((e) => console.error(e));
                            } else {
                              enqueue({
                                message: 'Something wrong has happened',
                                startEnhancer: ({ size }) => (<Delete size={size} />),
                              }, DURATION.short);
                            }
                          }}
                        >
                          Delete Task
                        </Button>
                      </Block>
                      <Block>
                        <Button onClick={submitForm} isLoading={isSubmitting}>
                          Make Changes
                        </Button>
                      </Block>
                    </Block>
                  </Block>
                )}
              </Formik>
            </Block>
          )}
        </Container>
      </Block>
    </FullscreenBlock>
  );
};

export default Page;
