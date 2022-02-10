import React, { useMemo, useState } from 'react';
import Lazy from 'lazy.js';
import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid';
import { useRouter } from 'next/router';
import { Plus, Search } from 'baseui/icon';
import Header from '@app/components/Header';
import { TasksSkeleton, TaskCard } from '@components/Tasks';
import { Container, FullscreenBlock, FullscreenLoader, Card, ButtonLink } from '@components/DefaultBlocks';
import { getProfile, getUsers } from '@utils/routes';
import { Input } from 'baseui/input';
import { Select } from 'baseui/select';
import {
  StatefulDataTable,
  BooleanColumn,
  CategoricalColumn,
  CustomColumn,
  NumericalColumn,
  StringColumn,
  COLUMNS,
  NUMERICAL_FORMATS,
} from 'baseui/data-table';

type RowDataT = [
  string,
  boolean,
  string,
  string,
];

const columns = [
  CategoricalColumn({
    title: 'ID',
    mapDataToValue: (data: RowDataT) => data[0],
  }),
  BooleanColumn({
    title: 'Is Admin',
    mapDataToValue: (data: RowDataT) => data[1],
  }),
  StringColumn({
    title: 'Name',
    mapDataToValue: (data: RowDataT) => data[2],
  }),
  StringColumn({
    title: 'E-Mail',
    mapDataToValue: (data: RowDataT) => data[3],
  }),
  CustomColumn({
    title: 'Actions',
    mapDataToValue: (data: RowDataT) => data,
    renderCell: (props) => {
      return <>Hello world!</>;
    },
  })
];

const Page = () => {
  const { user, isValidating } = getProfile();
  const { users, isValidating: usersValidating } = getUsers();
  const [css, { colors, sizing }] = useStyletron();
  const router = useRouter();
  const [filter, setFilter] = useState({ name: '', tags: [] });

  const userRows = useMemo(() => {
    if (isValidating || !users) return [];

    console.log(users);

    return users.map(({ _id, admin, name, email }) => ({
      id: _id,
      data: [_id, admin, name, email],
    }));
  }, [users, isValidating]);

  if (isValidating) {
    return (<FullscreenLoader />);
  }

  if (!user) {
    router.push('/login');
    return (<FullscreenLoader />);
  }

  return (
    <FullscreenBlock display="flex" flexDirection="column">
      <Header user={user} title="Users" subtitle="Users are the part of CTF" />
      <Block
        backgroundColor={colors.backgroundSecondary}
        className="grow"
        padding="70px 0"
      >
        <Container>
          <Card marginBottom="70px" className={css({ height: '800px' })}>
            <StatefulDataTable
              columns={columns}
              rows={userRows}
              emptyMessage="Nothing is here? huh?"
            />
          </Card>
        </Container>
      </Block>
    </FullscreenBlock>
  );
};

export default Page;
