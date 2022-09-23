/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import capitalize from 'lodash/capitalize';
import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { AppNavBar, AppNavBarPropsT, NavItemT } from 'baseui/app-nav-bar';
import { StyledLink } from 'baseui/link';
import { DisplayMedium, HeadingXSmall, LabelMedium } from 'baseui/typography';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { User } from 'moectf-core/models';
import { useAppDispatch, useAppSelector } from '@redux/hooks';
import { setTheme } from '@redux/slices/site';
import { Plus } from 'baseui/icon';
import { Button } from 'baseui/button';
import { logout } from '@utils/moe-fetch';
import { Container } from './DefaultBlocks';

type HeaderProps = AppNavBarPropsT & {
  user: Partial<User>;
  title?: string;
  subtitle?: string;
  description?: string;
};

type AppNavItem = (Omit<NavItemT, 'info'> & { info: string });

const menu = (activeLink: string): AppNavItem[] => ([
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
  {
    label: 'Create Task',
    info: '/tasks',
  },
].map((value) => ({ ...value, active: value.info == activeLink })));

const Header = ({ user, title, subtitle, description, ...props }: HeaderProps): JSX.Element => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.site.theme);
  const [css, { borders, colors }] = useStyletron();
  const viceVersaTheme = theme == 'light' ? 'dark' : 'light';

  return (
    <>
      <AppNavBar
        mainItems={menu(router.asPath)}
        onMainItemSelect={(item: AppNavItem) => {
          router.push(item.info)
            .catch((e) => console.error(e));
        }}
        username={user.name}
        userItems={[
          { label: `Set ${capitalize(viceVersaTheme)} Theme`, info: 'theme' },
          { label: 'Log Out', info: 'logout' },
        ]}
        onUserItemSelect={async (item) => {
          switch (item.info) {
            case 'theme': {
              dispatch(setTheme(viceVersaTheme));
              break;
            }
            case 'logout': {
              if (await logout()) {
                router.push('/login')
                  .catch((e) => console.error(e));
              }

              break;
            }
            default: break;
          }
        }}
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
        title={<NextLink href="/" passHref><StyledLink>MoeCTF</StyledLink></NextLink>}
        mapItemToNode={({ label, info }) => {
          if (info == '/tasks') {
            return (
              <Button
                size="compact"
                endEnhancer={(<Plus size={14} />)}
              >
                {label}
              </Button>
            );
          }

          return label;
        }}
        {...props}
      />
      {
        (title || subtitle || description) && (
          <Block
            padding="70px 0"
            backgroundColor={colors.backgroundPrimary}
            className={css({
              borderBottomWidth: '1px',
              borderBottomStyle: 'solid',
              borderBottomColor: borders.border200.borderColor,
            })}
          >
            <Container>
              {subtitle && <HeadingXSmall marginBottom="20px">{subtitle}</HeadingXSmall>}
              {title && <DisplayMedium>{title}</DisplayMedium>}
              {description && (
                <LabelMedium
                  color={colors.contentTertiary}
                  width={['auto', 'auto', '50%']}
                  marginTop="20px"
                >
                  {description}
                </LabelMedium>
              )}
            </Container>
          </Block>
        )
      }
    </>
  );
};

export default Header;
