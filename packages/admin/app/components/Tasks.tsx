import { Task } from 'moectf-core/models';
import React from 'react';
import NextLink from 'next/link';
import truncate from 'lodash/truncate';
import { useStyletron } from 'baseui';
import { Skeleton } from 'baseui/skeleton';
import { Block } from 'baseui/block';
import { Tag } from 'baseui/tag';
import { FlexGridItem } from 'baseui/flex-grid';
import { LabelLarge, ParagraphMedium } from 'baseui/typography';

export const TasksSkeleton = [1, 2, 3, 4, 5, 6, 7, 8].map((v) => (
  <FlexGridItem key={v}>
    <Skeleton
      width="100%"
      height="200px"
      animation
    />
  </FlexGridItem>
));

type TaskCardProps = {
  task: Task;
  onTagClick?: (tag: string) => void;
};

export const TaskCard = ({ task, onTagClick }: TaskCardProps) => {
  const [, { colors }] = useStyletron();

  return (
    <NextLink href={`/tasks/${task._id}`} passHref>
      <a
        href=""
        onClick={(e) => {
          if (e.target instanceof Element) {
            if (e.target.parentElement.attributes.getNamedItem('data-baseweb').value == 'tag') {
              e.preventDefault();
            }
          }
        }}
        tabIndex={0}
      >
        <Block
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          width="100%"
          minHeight="200px"
          padding="20px"
          backgroundColor={colors.primaryB}
          className="block transition shadow-2xl hover:shadow-md hover:ease-out active:shadow-none"
        >
          <Block>
            <LabelLarge className="mb-2 hover:underline inline-block">
              {truncate(task.name, { length: 50 })}
            </LabelLarge>
            <ParagraphMedium color={colors.contentTertiary} marginBottom="20px">
              {truncate(task.content, { length: 80 })}
            </ParagraphMedium>
          </Block>
          <Block marginLeft="-5px">
            {task.tags.map((name) => (
              <Tag
                key={name}
                closeable={false}
                onClick={() => { if (onTagClick) { onTagClick(name); } }}
              >
                {name}

              </Tag>
            ))}
          </Block>
        </Block>
      </a>
    </NextLink>

  );
};
