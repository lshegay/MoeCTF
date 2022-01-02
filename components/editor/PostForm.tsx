import React, { useRef } from 'react';
import isEmpty from 'lodash/isEmpty';
import { Button, Text, Input, Spacer, useToasts, Link, useModal, Modal } from '@geist-ui/react';
import { useRouter } from 'next/router';
import { css } from '@emotion/css';
import { Form, Formik, FormikErrors } from 'formik';
import { EditorState } from 'draft-js';
import { Post } from '@models/units';
import { Response } from '@utils/response';
import { converToString } from '@components/etc/Editor';
import { Overwrite } from '@utils/types';
import 'whatwg-fetch';

type PostFormProps = {
  post: Partial<Post>;
  editorState: EditorState;
};

type PostFormUnit = Overwrite<Partial<Post>, {
  date?: string;
}>;

const LabelStyle = css(`
  text-transform: uppercase;
  color: #666666 !important;
  margin-bottom: 6px;
`);
const ErrorStyle = css(`
  margin: 5px 0 10px;
`);

const formValidate = () => (
  (values: PostFormUnit): FormikErrors<PostFormUnit> => {
    const errors: FormikErrors<PostFormUnit> = {};

    if (isEmpty(values.name)) {
      errors.name = 'Please provide a post name.';
    }

    return errors;
  }
);

const PostForm = ({
  post,
  editorState,
}: PostFormProps): JSX.Element => {
  const router = useRouter();
  const isPost = !!post._id;
  const [, setToast] = useToasts();
  const { setVisible, bindings } = useModal();

  return (
    <>
      <Formik
        initialValues={{
          name: post.name,
          content: post.content,
          date: post.date?.toString(),
        }}
        validate={formValidate()}
        onSubmit={async (values, { setSubmitting, setErrors, setFieldValue }): Promise<void> => {
          const content = converToString(editorState);
          const postValues = { ...values, content };

          if (isPost) {
            const res = await window.fetch(`/api/admin/posts/${post._id}`, {
              method: 'PUT',
              body: JSON.stringify(postValues),
              headers: {
                'Content-Type': 'application/json',
              },
            });

            const response: Response<{ post: FormikErrors<PostFormUnit> }> = await res.json();
            if (response.status == 'success') {
              setToast({ text: 'Post has been updated.', type: 'success' });
              return;
            }

            setErrors(response.data.post);
            setToast({ text: 'Something wrong has happened. Nothing was changed.', type: 'error' });
          } else {
            const res = await window.fetch('/api/admin/posts', {
              method: 'POST',
              body: JSON.stringify(postValues),
              headers: {
                'Content-Type': 'application/json',
              },
            });

            const response: Response<{ post: FormikErrors<PostFormUnit> }> = await res.json();
            if (response.status == 'success') {
              setToast({ text: 'Post has been created.', type: 'success' });
              await router.push(`/admin/editor/posts?pid=${response.data.post._id}`);
              setFieldValue('date', response.data.post.date.toString());
              return;
            }

            setErrors(response.data.post);
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
          values,
        }): JSX.Element => (
          <Form className={css('display: flex; flex-direction: column;')}>
            <Text span b font="12px" className={LabelStyle}>Post name</Text>
            <Input
              scale={4 / 3}
              width="100%"
              placeholder="post-name"
              name="name"
              onChange={handleChange}
              initialValue={values.name}
            />
            <Text span type="error" font="14px" className={ErrorStyle}>{errors?.name}</Text>
            <Text span b font="12px" className={LabelStyle}>Post Created</Text>
            <Input
              scale={4 / 3}
              name="date"
              htmlType="date"
              width="100%"
              disabled
              placeholder="500"
              onChange={handleChange}
              value={values.date && (
                new Date(parseInt(values.date, 10)).toISOString().substring(0, 10)
              )}
            />
            <Text span type="error" font="14px" className={ErrorStyle}>{errors?.date}</Text>
            <Button type="secondary" onClick={submitForm} loading={isSubmitting} shadow>
              {isPost ? 'Update Post' : 'Add Post'}
            </Button>
            {isPost && (
              <>
                <Spacer h={1} />
                <Button
                  type="error"
                  shadow
                  onClick={(): void => setVisible(true)}
                >
                  Delete Post
                </Button>
              </>
            )}
          </Form>
        )}
      </Formik>
      <Modal {...bindings}>
        <Modal.Title>Are you sure?</Modal.Title>
        <Modal.Subtitle>Delete Post</Modal.Subtitle>
        <Modal.Content className={css('text-align: center !important;')}>
          <p>You want to delete this post? Сhanges are irreversible!</p>
        </Modal.Content>
        <Modal.Action passive onClick={(): void => setVisible(false)}>Cancel</Modal.Action>
        <Modal.Action
          onClick={async (): Promise<void> => {
            setVisible(false);
            const res = await window.fetch(`/api/admin/posts/${post._id}`, {
              method: 'DELETE',
            });

            const response: Response<{ post: FormikErrors<PostFormUnit> }> = await res.json();

            if (response.status == 'success') {
              setTimeout(() => router.push('/admin/posts'), 2000);
              setToast({ text: 'Post has been deleted.', type: 'success' });
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

export default PostForm;
