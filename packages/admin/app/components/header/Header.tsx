import { User } from 'moectf-core/models';
import { Response } from 'moectf-core/response';
import React from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import {
  AppNavBar,
  AppNavBarPropsT,
  setItemActive,
} from 'baseui/app-nav-bar';
import capitalize from 'lodash/capitalize';
import Styles from '@utils/styles';
import { Button } from 'baseui/button';
import { setTheme } from '@redux/slices/site';
import { useAppDispatch, useAppSelector } from '@redux/hooks';
import routes from '@utils/routes';
import { useStyletron } from 'baseui';

type HeaderProps = AppNavBarPropsT & {
  user: Partial<User>;
}

const menu = (activeLink: string) => ([
  {
    label: 'Tasks',
    info: '/',
  },
  {
    label: 'Posts',
    info: '/posts',
  },
  {
    label: 'Users',
    info: '/users',
  },
  {
    label: 'Scoreboard',
    info: '/scoreboard',
  },
  {
    label: 'Settings',
    info: '/settings',
  },
].map((value) => ({ ...value, active: value.info == activeLink })));

const Header = ({ user, ...props }: HeaderProps): JSX.Element => {
  const isUser = !!user?._id;
  const router = useRouter();
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.site.theme);
  const [css, { borders }] = useStyletron();
  const viceVersaTheme = theme == 'light' ? 'dark' : 'light';

  return (
    <AppNavBar
      title="MoeCTF"
      mainItems={menu(router.asPath)}
      onMainItemSelect={(item) => {
        router.push(item.info);
      }}
      {...(isUser ? {
        username: user.name,
        userItems: [
          { label: `Set ${capitalize(viceVersaTheme)} Theme`, info: 'theme' },
          { label: 'Log Out', info: 'logout' },
        ],
        onUserItemSelect: async (item) => {
          switch (item.info) {
            case 'theme': {
              dispatch(setTheme(viceVersaTheme));
              break;
            }
            case 'logout': {
              const response: Response<null> = (
                await (await fetch(routes.logout, { credentials: 'include' })).json()
              );

              if (response.status == 'success') {
                router.push('/login');
              }

              break;
            }
            default: {
              break;
            }
          }
        },
      } : {})}
      overrides={{
        Root: {
          style: {
            boxShadow: 'none',
            borderBottomWidth: '1px',
            borderBottomStyle: 'solid',
            borderBottomColor: borders.border200.borderColor,
          },
        },
      }}
      {...props}
    />
  );
};

export default Header;
