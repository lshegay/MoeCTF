import React from 'react';
import NextLink from 'next/link';
import { Link, Avatar, Popover, useToasts, } from '@geist-ui/react';
import { css } from '@emotion/css';
import Styles from '@utils/styles';
import { User } from '@models/units';
import { Response } from '@utils/response';
import { useRouter } from 'next/router';
import 'whatwg-fetch';

type NavProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
  user: Partial<User>;
};

const cl = css(`
  &:hover {
    background-color: #fafafa;
    cursor: pointer !important;
  }
`);

const Nav = ({ user, ...rest }: NavProps): JSX.Element => {
  const isUser = !!user._id;
  const avatar = user.avatar != null ? user.avatar : '/default_user.png';
  const router = useRouter();
  const [, setToast] = useToasts();
  const showToast = (type: string): void => {
    switch (type) {
      case 'success': {
        setToast({ text: 'You have been logout', type });
        break;
      }
      default: {
        setToast({ text: 'Something wrong has happened, your session has not been deleted.', type: 'error' });
        break;
      }
    }
  };

  let controls;

  if (!isUser) {
    controls = (
      <>

      </>
    );
  } else {
    const menu = (): JSX.Element => (
      <div
        className={css(`
          width: 225px;
          text-align: center;
          margin: -8px 0;
        `)}
      >
        <Popover.Item className={cl}>
          <NextLink href="/admin" passHref>
            <Link>Dashboard</Link>
          </NextLink>
        </Popover.Item>
        <Popover.Item line />
        <Popover.Item
          className={cl}
          onClick={async (): Promise<void> => {
            const res = await window.fetch('/api/logout', { method: 'GET' });
            const response: Response<{}> = await res.json();

            showToast(response.status);

            if (response.status == 'success') {
              setTimeout(() => router.push('/admin/login'), 2000);
            }
          }}
        >
          Logout
        </Popover.Item>
      </div>
    );

    controls = (
      <>
        <NextLink href="/admin/docs" passHref>
          <Link underline>
            Docs
          </Link>
        </NextLink>
        <Popover
          content={menu}
        >
          <Avatar
            text="user"
            width={1.3}
            height={1.3}
            src={avatar}
            className={css('cursor: pointer;')}
          />
        </Popover>
      </>
    );
  }

  return (
    <div
      className={css`
        ${!isUser ? 'box-shadow: inset 0 -1px #eaeaea;' : ''}
      `}
    >
      <nav
        className={css(`
          display: flex;
          -webkit-box-align: center;
          align-items: center;
          -webkit-box-pack: justify;
          justify-content: space-between;
          height: ${Styles.header.nav.height};
          max-width: ${Styles.container.maxWidth};
          margin: 0 auto;
          user-select: none;
        `)}
        {...rest}
      >
        <NextLink href="/admin" passHref>
          <Link block>MoeCTF</Link>
        </NextLink>
        <div
          className={css(`
            height: 100%;
            display: flex;
            -webkit-box-align: center;
            align-items: center;
            -webkit-box-pack: justify;
            margin: 0;
            position: relative;
            gap: 20px;
          `)}
        >
          {controls}
        </div>
      </nav>
    </div>
  );
};

export default Nav;
