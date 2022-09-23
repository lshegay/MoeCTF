import React, { useMemo, useState } from 'react';
import lazyJS from 'lazy.js';
import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid';
import { useRouter } from 'next/router';
import { Plus, Search } from 'baseui/icon';
import Header from '@app/components/Header';
import { TasksSkeleton, TaskCard } from '@components/Tasks';
import { Container, FullscreenBlock, FullscreenLoader, Card, ButtonLink } from '@components/DefaultBlocks';
import { useProfile, useTasks } from '@utils/moe-hooks';
import { Input } from 'baseui/input';
import { Select, Option } from 'baseui/select';

type FilterState = { name: string; tags: Option[] };

const Page = () => {
  const { user, isValidating } = useProfile();
  const { tasks, isValidating: tasksValidating } = useTasks();
  const [, { colors, sizing }] = useStyletron();
  const router = useRouter();
  const [filter, setFilter] = useState<FilterState>({ name: '', tags: [] });

  const tagsList = useMemo(() => {
    if (isValidating || !tasks) {
      return [];
    }

    const dict = new Set();
    const list: Array<Option> = [];

    tasks.forEach((task) => {
      task.tags?.forEach((tag) => {
        if (!dict.has(tag)) {
          list.push({ label: tag, id: tag });
        }

        dict.add(tag);
      });
    });

    return list;
  }, [tasks, isValidating]);

  if (!user) {
    if (!isValidating) {
      router.push('/login')
        .catch((e) => { console.error(e); });
    }

    return (<FullscreenLoader />);
  }

  let tasksElements = TasksSkeleton;

  if (!tasksValidating && tasks) {
    let lazy = lazyJS(tasks)
      .filter((v) => v.name.toLowerCase().includes(filter.name.toLowerCase()));

    if (filter.tags.length > 0) {
      lazy = lazy.filter((task) => (
        task.tags.some((tag) => filter.tags.some(({ id }) => id == tag))
      ));
    }

    tasksElements = lazy
      .map((task) => (
        <FlexGridItem key={task._id}>
          <TaskCard
            task={task}
            onTagClick={(tagName) => {
              if (!filter.tags.find((tag) => tag.id == tagName)) {
                setFilter((v) => ({ ...v, tags: [...v.tags, { id: tagName, label: tagName }] }));
              }
            }}
          />
        </FlexGridItem>
      ))
      .toArray();
  }

  return (
    <FullscreenBlock display="flex" flexDirection="column">
      <Header user={user} title="Tasks" subtitle="Manipulate your tasks here" />
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
                  placeholder="Search by Task Name"
                  onChange={({ currentTarget: { value } }) => {
                    setFilter((s) => ({ ...s, name: value }));
                  }}
                />
              </FlexGridItem>
              <FlexGridItem>
                <Select
                  multi
                  placeholder="Search by Tags"
                  options={tagsList}
                  value={filter.tags}
                  onChange={({ value }) => {
                    setFilter((s) => ({ ...s, tags: [...value] }));
                  }}
                />
              </FlexGridItem>
              <FlexGridItem />
              <FlexGridItem display="flex" justifyContent="flex-end">
                <ButtonLink className="w-full" href="/tasks" endEnhancer={<Plus size={18} />}>
                  Create Task
                </ButtonLink>
              </FlexGridItem>
            </FlexGrid>
          </Card>
          <Block>
            <FlexGrid
              flexGridColumnCount={[1, 1, 2, 4]}
              flexGridColumnGap={sizing.scale700}
              flexGridRowGap={sizing.scale700}
            >
              {tasksElements}
            </FlexGrid>
          </Block>
        </Container>
      </Block>
    </FullscreenBlock>
  );
};

export default Page;
