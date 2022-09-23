import React, { useState } from 'react';
import { Formik, FormikErrors } from 'formik';
import { Input } from 'baseui/input';
import truncate from 'lodash/truncate';
import moment from 'moment';
import { useStyletron } from 'baseui';
import { Skeleton } from 'baseui/skeleton';
import { Block } from 'baseui/block';
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid';
import { LabelLarge, ParagraphMedium, ParagraphSmall } from 'baseui/typography';
import { Post } from 'moectf-core/models';
import { Status } from 'moectf-core/response';
import { DURATION, useSnackbar } from 'baseui/snackbar';
import { deletePost, updatePost, UpdatePostValues } from '@utils/moe-fetch';
import { FormControl } from 'baseui/form-control';
import { Textarea } from 'baseui/textarea';
import { Check, Delete } from 'baseui/icon';
import { ButtonLink } from './DefaultBlocks';

const formValidate = (values: UpdatePostValues) => {
  const errors: Partial<FormikErrors<UpdatePostValues>> = {};

  if (values.name == '') {
    errors.name = 'Please provide a user name.';
  }

  if (values.content == '') {
    errors.content = 'Please provide content.';
  }

  return errors;
};

export const TasksSkeleton = [1, 2, 3, 4, 5, 6, 7, 8].map((v) => (
  <FlexGridItem key={v}>
    <Skeleton
      width="100%"
      height="200px"
      animation
    />
  </FlexGridItem>
));

type PostCardProps = {
  post: Post;
  onDelete: (post: Post) => void | Promise<void>;
};

export const PostCard = ({ post, onDelete }: PostCardProps) => {
  const [, { colors }] = useStyletron();
  const [editMode, setEditMode] = useState(false);
  const { enqueue, dequeue } = useSnackbar();

  return (
    <Block
      flexDirection="column"
      justifyContent="space-between"
      className="flex transition shadow-2xl"
      width="100%"
      padding="20px"
      backgroundColor={colors.primaryB}
    >
      {
        !editMode
          ? (
            <>
              <Block marginBottom="20px">
                <LabelLarge className="mb-2 hover:underline inline-block">
                  {post.name}
                </LabelLarge>
                <ParagraphSmall color={colors.contentTertiary} marginBottom="10px">
                  {moment(post.date).toLocaleString()}
                </ParagraphSmall>
                <ParagraphMedium>
                  {truncate(post.content, { length: 80 })}
                </ParagraphMedium>
              </Block>
              <FlexGrid
                flexGridColumnCount={2}
                flexGridRowGap="10px"
                flexGridColumnGap="20px"
              >
                <FlexGridItem>
                  {/* TODO: удаление с проверкой (модальное окно, например) */}
                  <ButtonLink
                    className="w-full"
                    kind="secondary"
                    onClick={async () => {
                      enqueue({ message: 'Making Changes', progress: true }, DURATION.infinite);

                      const response = await deletePost(post._id);

                      dequeue();
                      if (response.status == Status.SUCCESS) {
                        await onDelete(post);
                        enqueue({
                          message: 'Post was deleted successfully',
                          // eslint-disable-next-line react/no-unstable-nested-components
                          startEnhancer: ({ size }) => (<Check size={size} />),
                        }, DURATION.short);
                      } else {
                        enqueue({
                          message: 'Something has been wrong',
                          // eslint-disable-next-line react/no-unstable-nested-components
                          startEnhancer: ({ size }) => (<Delete size={size} />),
                        }, DURATION.short);
                      }
                      setEditMode(false);
                    }}
                  >
                    Delete Post
                  </ButtonLink>
                </FlexGridItem>
                <FlexGridItem>
                  <ButtonLink
                    className="w-full"
                    onClick={() => {
                      setEditMode(true);
                    }}
                  >
                    Edit Post
                  </ButtonLink>
                </FlexGridItem>
              </FlexGrid>
            </>
          )
          : (
            <Formik
              initialValues={{
                name: post.name,
                content: post.content,
              }}
              validate={formValidate}
              onSubmit={async (values, { setSubmitting, setErrors }) => {
                enqueue({ message: 'Making Changes', progress: true }, DURATION.infinite);

                const response = await updatePost(post._id, values);

                dequeue();
                if (response.status == Status.SUCCESS) {
                  enqueue({
                    message: 'Changes were made successfully',
                    // eslint-disable-next-line react/no-unstable-nested-components
                    startEnhancer: ({ size }) => (<Check size={size} />),
                  }, DURATION.short);
                  setEditMode(false);
                } else {
                  setErrors(response.data);
                }

                setSubmitting(false);
              }}
            >
              {({
                values,
                errors,
                submitForm,
                isSubmitting,
                handleChange,
              }) => (
                <FlexGrid
                  flexGridRowGap="5px"
                >
                  <FlexGridItem>
                    <FormControl label="Name" error={errors.name}>
                      <Input name="name" value={values.name} onChange={handleChange} />
                    </FormControl>
                  </FlexGridItem>
                  <FlexGridItem>
                    <FormControl label="Content" error={errors.content}>
                      <Textarea name="content" value={values.content} onChange={handleChange} />
                    </FormControl>
                  </FlexGridItem>
                  <FlexGridItem>
                    <FlexGrid
                      flexGridColumnCount={2}
                      flexGridRowGap="10px"
                      flexGridColumnGap="20px"
                    >
                      <FlexGridItem>
                        <ButtonLink className="w-full" onClick={() => { setEditMode(false); }}>
                          Stop Edit
                        </ButtonLink>
                      </FlexGridItem>
                      <FlexGridItem>
                        <ButtonLink className="w-full" onClick={submitForm} isLoading={isSubmitting}>
                          Edit Post
                        </ButtonLink>
                      </FlexGridItem>
                    </FlexGrid>
                  </FlexGridItem>
                </FlexGrid>
              )}
            </Formik>
          )
      }
    </Block>
  );
};
