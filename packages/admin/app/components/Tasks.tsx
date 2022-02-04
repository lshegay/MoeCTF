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
import { StyledLink } from 'baseui/link';
import { Grid, Cell } from 'baseui/layout-grid';
import { HeadingLevel } from 'baseui/heading';
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid';
import { DisplayMedium, HeadingXSmall } from 'baseui/typography';

export const TasksSkeleton = new Array(4).fill(undefined).map((_, index) => (
  <FlexGridItem key={index}>
    <Skeleton
      width="100%"
      height="200px"
      animation
    />
  </FlexGridItem>
));

type TaskCardProps = {
  task: Task;
}

export const TaskCard = ({ task }: TaskCardProps) => {
  const [_, { colors }] = useStyletron();

  return (
    <NextLink href={`/tasks/${task._id}`} passHref>
      <a className="block">
        <Block
          width="100%"
          height="200px"
          className="transition shadow-md hover:shadow-lg hover:ease-out"
          backgroundColor={colors.primaryB}
        >
          {task.name}
        </Block>
      </a>
    </NextLink>

  );
};
