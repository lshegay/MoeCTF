import React from 'react';
import { useRouter } from 'next/router';
import Header from '@app/components/Header';
import { useProfile } from '@utils/moe-hooks';
import { Card, Container, FullscreenBlock, FullscreenLoader } from '@components/DefaultBlocks';
import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid';
import { HeadingLarge } from 'baseui/typography';
import { Check } from 'baseui/icon';
import { Textarea } from 'baseui/textarea';
import { Formik, FormikErrors } from 'formik';
import { FormControl } from 'baseui/form-control';
import { Input } from 'baseui/input';
import { TagInput } from '@app/components/Input';
import { Button } from 'baseui/button';
import { Uploader } from '@app/components/Uploader';
import { useSnackbar, DURATION } from 'baseui/snackbar';
import { Status } from 'moectf-core/response';
import { createTask, CreateTaskValues } from '@utils/moe-fetch';

const formValidate = (values: CreateTaskValues) => {
  const errors: Partial<FormikErrors<CreateTaskValues>> = {};

  if (values.name == '') {
    errors.name = 'Please provide a user name.';
  }

  if (values.flag == '') {
    errors.flag = 'Please provide a flag value.';
  }

  if (values.points < 0) {
    errors.points = 'Please provide points.';
  }

  return errors;
};

const Page = () => {
  const router = useRouter();

  const { user, isValidating } = useProfile();
  const [, { colors }] = useStyletron();
  const { enqueue, dequeue } = useSnackbar();

  if (!user) {
    if (!isValidating) {
      router.push('/login')
        .catch((e) => { console.error(e); });
    }

    return (<FullscreenLoader />);
  }

  return (
    <FullscreenBlock display="flex" flexDirection="column">
      <Header
        user={user}
        title="Create Task"
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
          <Card>
            <HeadingLarge className="mb-10">Create Data</HeadingLarge>
            <Formik
              initialValues={{
                name: undefined,
                content: '',
                flag: undefined,
                points: undefined,
                tags: [],
                file: null,
              }}
              validate={formValidate}
              onSubmit={async (values, { setSubmitting, setErrors }) => {
                enqueue({ message: 'Making Changes', progress: true }, DURATION.infinite);

                const response = await createTask(values);

                dequeue();
                if (response.status == Status.SUCCESS) {
                  enqueue({
                    message: 'A new Task was created!',
                    startEnhancer: ({ size }) => (<Check size={size} />),
                  }, DURATION.short);
                  const { _id } = response.data.task;

                  router.push(`/tasks/${_id}`)
                    .catch((e) => console.error(e));
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
                        <Input name="name" value={values.name} onChange={handleChange} required clearable />
                      </FormControl>
                    </FlexGridItem>
                    <FlexGridItem>
                      <FormControl label="Flag" error={errors.flag}>
                        <Input name="flag" value={values.flag} onChange={handleChange} required clearable />
                      </FormControl>
                    </FlexGridItem>
                    <FlexGridItem>
                      <FormControl label="Content" error={errors.content}>
                        <Textarea name="content" value={values.content} onChange={handleChange} clearable />
                      </FormControl>
                    </FlexGridItem>
                    <FlexGridItem>
                      <FormControl label="Points" error={errors.points}>
                        <Input name="points" type="number" value={values.points} onChange={handleChange} min={0} required clearable />
                      </FormControl>
                    </FlexGridItem>
                    <FlexGridItem>
                      <FormControl label="Tags" error={errors.tags} caption="Hit Enter to add a tag">
                        <TagInput name="tags" value={values.tags} onChange={(tags) => setFieldValue('tags', tags)} clearable />
                      </FormControl>
                    </FlexGridItem>
                    <FlexGridItem>
                      <FormControl label="File" error={errors.file}>
                        <Uploader name="file" value={values.file} onChange={(file) => setFieldValue('file', file)} />
                      </FormControl>
                    </FlexGridItem>
                  </FlexGrid>
                  <Block
                    display="flex"
                    justifyContent="flex-end"
                  >
                    <Button onClick={submitForm} isLoading={isSubmitting}>Create Task</Button>
                  </Block>
                </Block>
              )}
            </Formik>
          </Card>
        </Container>
      </Block>
    </FullscreenBlock>
  );
};

export default Page;
