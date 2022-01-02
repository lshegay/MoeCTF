import React from 'react';
import NextLink from 'next/link';
import { Button, Link, Avatar, Tabs, useTabs } from '@geist-ui/react';
import { useRouter } from 'next/router';
import { css } from '@emotion/css';
import { GetServerSideProps } from 'next';
import get from '@funcs/get';
import Styles from '@utils/styles';
import { User } from '@models/units';
import Nav from '@components/header/Nav';

type HeaderProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
  user: Partial<User>;
};

const Header = ({ user, ...rest }: HeaderProps): JSX.Element => {
  const isUser = !!user._id;
  const router = useRouter();

  return (
    <>
      <header
        className={css(`
          background-color: white;
        `)}
        {...rest}
      >
        <Nav
          user={user}
        />
        {isUser && (
          <div
            className={css(`
              box-shadow: inset 0 -1px #eaeaea;
            `)}
          >
            <Tabs
              initialValue={router.asPath}
              hideDivider
              onChange={(v): void => {
                router.push(v);
              }}
              className={css(`
                max-width: ${Styles.container.maxWidth};
                margin: 0 auto !important;
                > .content {
                  display: none;
                }
                .tab {
                  font-size: 14px !important;
                  padding: 0 12px 16px !important;
                  margin: 0 !important;

                  &:hover {
                    color: #000000;
                  }
                }
              `)}
            >
              <Tabs.Item label="tasks" value="/admin" />
              <Tabs.Item label="announcements" value="/admin/posts" />
              <Tabs.Item label="users" value="/admin/users" />
              <Tabs.Item label="scoreboard" value="/admin/scoreboard" />
              <Tabs.Item label="settings" value="/admin/settings" />
            </Tabs>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
