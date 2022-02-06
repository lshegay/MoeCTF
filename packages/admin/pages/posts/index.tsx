import React, { useMemo, useState } from 'react';
import Lazy from 'lazy.js';
import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid';
import { useRouter } from 'next/router';
import { Check, Plus, Search } from 'baseui/icon';
import Header from '@app/components/Header';
import { Response, ResponseS, Status } from 'moectf-core/response';
import { TasksSkeleton, TaskCard } from '@components/Tasks';
import { Container, FullscreenBlock, FullscreenLoader, Card, ButtonLink } from '@components/DefaultBlocks';
import routes, { getProfile, getPosts } from '@utils/routes';
import { Input } from 'baseui/input';
import { Select } from 'baseui/select';
import { PostCard } from '@app/components/Posts';
import { Formik, FormikErrors } from 'formik';
import { DURATION, useSnackbar } from 'baseui/snackbar';
import request from 'moectf-core/request';
import { FormControl } from 'baseui/form-control';
import { Textarea } from 'baseui/textarea';
import { Button } from 'baseui/button';
import { HeadingLarge } from 'baseui/typography';
import { Post } from 'moectf-core/models';

type PostFormValues = {
  name?: string;
  content?: string;
};

type PostFormErrors = { [Property in keyof PostFormValues]: string };

type PostFormResponse = ResponseS<PostFormErrors, Status.ERROR>
  | ResponseS<{ post: Post }, Status.SUCCESS>;

const formValidate = (values: PostFormValues) => {
  const errors: Partial<FormikErrors<PostFormValues>> = {};

  if (values.name == '') {
    errors.name = 'Please provide a user name.';
  }

  if (values.content == '') {
    errors.content = 'Please provide content.';
  }

  return errors;
};

const Page = () => {
  const { user, isValidating } = getProfile();
  const { posts, isValidating: postsValidating, mutate } = getPosts();
  const [, { colors, sizing }] = useStyletron();
  const router = useRouter();
  const [filter, setFilter] = useState({ search: '' });
  const { enqueue, dequeue } = useSnackbar();

  if (isValidating) {
    return (<FullscreenLoader />);
  }

  if (!user) {
    router.push('/login');
    return (<FullscreenLoader />);
  }

  return (
    <FullscreenBlock display="flex" flexDirection="column">
      <Header user={user} title="Posts" subtitle="Make a post of a day here" />
      <Block
        backgroundColor={colors.backgroundSecondary}
        className="grow"
        padding="70px 0"
      >
        <Container>
          <Card marginBottom="70px">
            <FlexGrid
              flexGridColumnCount={[1, 1, 2, 4]}
              flexGridColumnGap="20px"
              flexGridRowGap="20px"
            >
              <FlexGridItem>
                <Input
                  endEnhancer={<Search size={18} />}
                  placeholder="Search by Name & Content"
                  onChange={({ currentTarget: { value } }) => (
                    setFilter((s) => ({ ...s, search: value }))
                  )}
                />
              </FlexGridItem>
            </FlexGrid>
          </Card>
          <Block>
            <FlexGrid
              flexGridColumnCount={[1, 1, 1, 2]}
              flexGridColumnGap={sizing.scale700}
              flexGridRowGap={sizing.scale700}
            >
              <FlexGridItem overrides={{ Block: { style: { width: '70%' } } }}>
                <FlexGrid flexGridRowGap={sizing.scale700}>
                  {
                    !postsValidating && posts
                    && Lazy(posts)
                      .filter((v) => (
                        !v.name || v.name?.toLowerCase().includes(filter.search.toLowerCase())
                        || !v.content
                        || v.content?.toLowerCase().includes(filter.search.toLowerCase())
                      ))
                      .map((post) => (
                        <FlexGridItem key={post._id}>
                          <PostCard
                            post={post}
                            onDelete={(post) => {
                              mutate(posts.filter(({ _id }) => _id == post._id));
                            }}
                          />
                        </FlexGridItem>
                      ))
                      .toArray()
                  }
                </FlexGrid>
              </FlexGridItem>
              <FlexGridItem>
                <Formik
                  initialValues={{
                    name: undefined,
                    content: undefined,
                  }}
                  validate={formValidate}
                  onSubmit={async (values, { setSubmitting, setErrors }) => {
                    enqueue({ message: 'Making Changes', progress: true }, DURATION.infinite);

                    const response: PostFormResponse = await (await fetch(routes.postsPost, {
                      method: 'POST',
                      body: JSON.stringify(values),
                      credentials: 'include',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                    })).json();

                    dequeue();
                    if (response.status == Status.SUCCESS) {
                      mutate({ ...posts });
                      enqueue({
                        message: 'Changes were made successfully',
                        // TODO: заменить такие функции
                        // eslint-disable-next-line react/no-unstable-nested-components
                        startEnhancer: ({ size }) => (<Check size={size} />)
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
                    submitForm,
                    isSubmitting,
                    handleChange,
                  }) => (
                    <Card>
                      <HeadingLarge className="mb-10">Create Post</HeadingLarge>
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
                          <ButtonLink className="w-full" onClick={submitForm} isLoading={isSubmitting}>
                            Create New Post
                          </ButtonLink>
                        </FlexGridItem>
                      </FlexGrid>
                    </Card>
                  )}
                </Formik>
              </FlexGridItem>
            </FlexGrid>
          </Block>
        </Container>
      </Block>
    </FullscreenBlock>
  );
};

export default Page;
