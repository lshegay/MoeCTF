import React from 'react';
import { Button, Text, Input } from '@geist-ui/react';
import { useRouter } from 'next/router';
import { css } from '@emotion/css';
import get from '@funcs/get';
import { isAdmin } from '@funcs/user';
import Styles from '@utils/styles';
import { User } from '@models/units';
import Header from '@components/header/Header';
import { Form, Formik } from 'formik';
import { Response } from '@utils/response';
import { GetServerSideProps } from 'next';
import 'whatwg-fetch';

type PageProps = {
  user: Partial<User>;
};

const InputPassword: any = Input.Password;
const LabelStyle = css(`
  text-transform: uppercase;
  color: #666666 !important;
  margin-bottom: 6px;
`);
const ErrorStyle = css(`
  margin: 5px 0 10px;
`);

const formValidate = (values): any => {
  const errors: any = {};

  if (values.name == '') {
    errors.name = 'Please provide a user name.';
  }

  if (values.password == '') {
    errors.password = 'Please provide a password.';
  }

  return errors;
};

const Page = ({ user }: PageProps): JSX.Element => {
  const router = useRouter();

  return (
    <>
      <Header user={user} />
      <div
        className={css(`
          height: calc(100vh - ${Styles.header.nav.height});
          display: flex;
          align-items: center;
          justify-content: center;
        `)}
      >
        <div
          className={css(`

          `)}
        >
          <Text h1>Authorization</Text>
          <div>
            <Formik
              initialValues={{
                name: '',
                password: '',
              }}
              validate={formValidate}
              onSubmit={async (values, { setSubmitting, setErrors }): Promise<void> => {
                const res = await window.fetch('/api/login', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(values),
                });

                const response: Response<any> = await res.json();
                if (response.status == 'success') {
                  router.push('/admin');
                } else {
                  setErrors(response.data);
                }

                setSubmitting(false);
              }}
            >
              {({
                errors,
                submitForm,
                isSubmitting,
                handleChange,
              }): JSX.Element => (
                <Form
                  className={css(`
                    display: flex;
                    flex-direction: column;
                  `)}
                >
                  <Text span b font="12px" className={LabelStyle}>User name</Text>
                  <Input
                    scale={4 / 3}
                    width="100%"
                    placeholder="user-name"
                    name="name"
                    onChange={handleChange}
                  />
                  <Text span type="error" font="14px" className={ErrorStyle}>{errors.name}</Text>
                  <Text span b font="12px" className={LabelStyle}>Password</Text>
                  <InputPassword onChange={handleChange} name="password" scale={4 / 3} width="100%" />
                  <Text span type="error" font="14px" className={ErrorStyle}>{errors.password}</Text>
                  <Button type="secondary" onClick={submitForm} loading={isSubmitting} shadow>Login</Button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<PageProps> = async ({ req }) => {
  const user: Partial<User> = await get.profile({ req }) ?? {};

  if (isAdmin({ req })) {
    return {
      redirect: {
        destination: '/admin',
        permanent: true,
      }
    };
  }

  return ({
    props: {
      user,
    },
  });
};

export default Page;
