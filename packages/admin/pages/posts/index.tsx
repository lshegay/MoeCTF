import React, { useState } from 'react';
import Lazy from 'lazy.js';
import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid';
import { DatePicker } from 'baseui/datepicker';
import { useRouter } from 'next/router';
import { Check, Search } from 'baseui/icon';
import Header from '@app/components/Header';
import { Status } from 'moectf-core/response';
import moment from 'moment';
import { Container, FullscreenBlock, FullscreenLoader, Card, ButtonLink } from '@components/DefaultBlocks';
import { useProfile, usePosts } from '@utils/moe-hooks';
import { Input } from 'baseui/input';
import { PostCard } from '@app/components/Posts';
import { Formik, FormikErrors } from 'formik';
import { DURATION, useSnackbar } from 'baseui/snackbar';
import { FormControl } from 'baseui/form-control';
import { Textarea } from 'baseui/textarea';
import { HeadingLarge } from 'baseui/typography';
import { createPost, CreatePostValues } from '@utils/moe-fetch';

const formValidate = (values: CreatePostValues) => {
  const errors: Partial<FormikErrors<CreatePostValues>> = {};

  if (values.name == '') {
    errors.name = 'Please provide a user name.';
  }

  if (values.content == '') {
    errors.content = 'Please provide content.';
  }

  return errors;
};

type FilterState = {
  search: string;
  date: Date[];
};

const Page = () => {
  const { user, isValidating } = useProfile();
  const { posts, isValidating: postsValidating, mutate } = usePosts();
  const [, { colors, sizing }] = useStyletron();
  const router = useRouter();
  const [filter, setFilter] = useState<FilterState>({ search: '', date: [] });
  const { enqueue, dequeue } = useSnackbar();

  if (isValidating) {
    return (<FullscreenLoader />);
  }

  if (!user) {
    router.push('/login')
      .catch((e) => console.error(e));
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
                  clearable
                  onChange={({ currentTarget: { value } }) => (
                    setFilter((s) => ({ ...s, search: value }))
                  )}
                />
              </FlexGridItem>
              <FlexGridItem>
                <DatePicker
                  range
                  quickSelect
                  value={filter.date}
                  clearable
                  onChange={({ date }) => {
                    if (!Array.isArray(date)) return;

                    setFilter((s) => ({ ...s, date }));
                  }}
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
                      // TODO: посмотреть на таймзоны
                      .filter((v) => (
                        !v.name || v.name?.toLowerCase().includes(filter.search.toLowerCase())
                        || !v.content
                        || v.content?.toLowerCase().includes(filter.search.toLowerCase())
                      ))
                      .filter((v) => (
                        !filter.date[0]
                        || !filter.date[1]
                        || moment(v.date).isBetween(
                          filter.date[0],
                          filter.date[1],
                          'days',
                          '[]',
                        )
                      ))
                      .map((post) => (
                        <FlexGridItem key={post._id}>
                          <PostCard
                            post={post}
                            onDelete={async () => {
                              await mutate(posts.filter(({ _id }) => _id == post._id));
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

                    const response = await createPost(values);

                    dequeue();
                    if (response.status == Status.SUCCESS) {
                      enqueue({
                        message: 'Changes were made successfully',
                        // TODO: заменить такие функции
                        // eslint-disable-next-line react/no-unstable-nested-components
                        startEnhancer: ({ size }) => (<Check size={size} />),
                      }, DURATION.short);
                      await mutate({ ...posts });
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
