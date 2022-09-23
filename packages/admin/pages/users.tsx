import React, { useMemo, useState } from 'react';
import Lazy from 'lazy.js';
import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid';
import { useRouter } from 'next/router';
import { Plus, Search, Delete, Check } from 'baseui/icon';
import Header from '@app/components/Header';
import { TasksSkeleton, TaskCard } from '@components/Tasks';
import { ButtonGroup } from 'baseui/button-group';
import { Button, KIND as ButtonKind } from 'baseui/button';
import { Container, FullscreenBlock, FullscreenLoader, Card, ButtonLink } from '@components/DefaultBlocks';
import { useProfile, useUsers } from '@utils/moe-hooks';
import { Input } from 'baseui/input';
import { Select } from 'baseui/select';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalButton,
  SIZE,
  ROLE,
} from 'baseui/modal';
import {
  StatefulDataTable,
  BooleanColumn,
  CategoricalColumn,
  CustomColumn,
  NumericalColumn,
  StringColumn,
  COLUMNS,
  NUMERICAL_FORMATS,
  RowT,
  ColumnT,
} from 'baseui/data-table';
import { Status } from 'moectf-core/response';
import { deleteUser } from '@utils/moe-fetch';
import { DURATION, useSnackbar } from 'baseui/snackbar';
import { Skeleton } from 'baseui/skeleton';

type RowDataT = [
  string,
  boolean,
  string,
  string,
];

const MODAL_CLOSED = { userId: '', open: false };

const Page = () => {
  const { user, isValidating } = useProfile();
  const { users, isValidating: usersValidating, mutate: mutateUsers } = useUsers();
  const [css, { colors, sizing }] = useStyletron();
  const router = useRouter();
  const [filter, setFilter] = useState({ name: '', tags: [] });
  const [modal, setModal] = useState(MODAL_CLOSED);
  const { enqueue, dequeue } = useSnackbar();

  const columns = useMemo<ColumnT[]>(() => (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    [CategoricalColumn({
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
      renderCell: ({ value: [userId] }) => (
        <ButtonGroup size="mini">
          {user._id != userId && (
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            <Button onClick={() => { setModal({ open: true, userId }); }}>Delete</Button>
          )}
        </ButtonGroup>
      ),
    })]), [user]);

  const userRows = useMemo<RowT[]>(() => {
    if (isValidating || !users) {
      return [];
    }

    return users.map(({ _id, admin, name, email }) => ({
      id: _id,
      data: [_id, admin, name, email],
    }));
  }, [users, isValidating]);

  if (!user && isValidating) {
    return (<FullscreenLoader />);
  }

  if (!user && !isValidating) {
    router.push('/login')
      .catch((e) => console.error(e));
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
          {userRows.length > 0 ? (
            <Card marginBottom="70px" className={css({ height: '800px' })}>
              <StatefulDataTable
                columns={columns}
                rows={userRows}
                rowHeight={44}
              />
            </Card>
          ) : (
            <Skeleton height="800px" animation />
          )}
        </Container>
      </Block>
      <Modal
        onClose={() => setModal(MODAL_CLOSED)}
        closeable
        isOpen={modal.open}
        animate
        autoFocus
        size={SIZE.default}
        role={ROLE.dialog}
      >
        <ModalHeader>Delete User</ModalHeader>
        <ModalBody>
          This action cannot be undone. Are you sure?
        </ModalBody>
        <ModalFooter>
          <ModalButton kind={ButtonKind.tertiary} onClick={() => setModal(MODAL_CLOSED)}>
            Cancel
          </ModalButton>
          <ModalButton
            onClick={async () => {
              enqueue({ message: 'Making Changes', progress: true }, DURATION.infinite);
              const { userId } = modal;
              setModal(MODAL_CLOSED);

              const response = await deleteUser(modal.userId);

              dequeue();
              if (response.status == Status.SUCCESS) {
                enqueue({
                  message: 'User was successfully deleted!',
                  startEnhancer: Check,
                }, DURATION.short);
                await mutateUsers(users.filter(({ _id }) => _id != userId));
              } else {
                enqueue({
                  message: response.data._id,
                  startEnhancer: Delete,
                }, DURATION.short);
              }
            }}
          >
            Delete
          </ModalButton>
        </ModalFooter>
      </Modal>
    </FullscreenBlock>
  );
};

export default Page;
