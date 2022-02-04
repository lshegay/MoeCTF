import { Task, User } from 'moectf-core/models';
import { Response } from 'moectf-core/response';
import React from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import Header from '@components/header/Header';
import { getProfile, getTasks } from '@utils/routes';
import { Container, FullscreenBlock, FullscreenLoader } from '@components/DefaultBlocks';
import { useStyletron } from 'baseui';
import { Skeleton } from 'baseui/skeleton';
import { Block } from 'baseui/block';
import { Grid, Cell } from 'baseui/layout-grid';
import { HeadingLevel } from 'baseui/heading';
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid';
import { DisplayMedium, HeadingXSmall } from 'baseui/typography';
import { TasksSkeleton, TaskCard } from '@components/Tasks';

const Page = () => {
  const { user, isValidating } = getProfile();
  const { tasks, isValidating: tasksValidating } = getTasks();
  const [css, { colors, sizing, borders }] = useStyletron();
  const router = useRouter();

  if (isValidating) {
    return (<FullscreenLoader />);
  }

  if (!user) {
    router.push('/login');
    return (<FullscreenLoader />);
  }

  return (
    <FullscreenBlock display="flex" flexDirection="column">
      <Header user={user} />
      <Block
        padding="70px 0"
        backgroundColor={colors.primaryB}
        className={css({
          borderBottomWidth: '1px',
          borderBottomStyle: 'solid',
          borderBottomColor: borders.border200.borderColor,
        })}
      >
        <Container>
          <HeadingXSmall>Manipulate your tasks here</HeadingXSmall>
          <DisplayMedium>Tasks</DisplayMedium>
        </Container>
      </Block>
      <Block
        backgroundColor={colors.backgroundSecondary}
        className="grow"
      >
        <Container>
          <Block padding="70px 0">
            <FlexGrid
              flexGridColumnCount={4}
              flexGridColumnGap={sizing.scale700}
              flexGridRowGap={sizing.scale700}
            >
              {tasksValidating
                ? TasksSkeleton
                : tasks.map((task) => (
                  <FlexGridItem key={task._id}>
                    <TaskCard task={task} />
                  </FlexGridItem>
                ))}
            </FlexGrid>
          </Block>
        </Container>
      </Block>
    </FullscreenBlock>
  );
};

export default Page;
