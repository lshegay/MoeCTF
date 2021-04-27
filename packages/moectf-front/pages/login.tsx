import React from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { Block } from 'baseui/block';
import { Display4 } from 'baseui/typography';
import { User } from 'moectf-core';
import { Formik } from 'formik';
import { FormControl } from 'baseui/form-control';
import Input from '../components/Input';
import Button from '../components/Button';
import Background from '../components/Background';

type PageProps = {
  startMatchDate: number,
  endMatchDate: number,
  user: User,
};

const Page: NextPage<PageProps> = ({ startMatchDate, endMatchDate }) => {
  const router = useRouter();

  return (
    <>
      <Block
        position="absolute"
        top="50%"
        left="50%"
        overrides={{
          Block: {
            style: {
              transform: 'translate(-50%, -50%)',
            },
          },
        }}
      >
        <Display4
          overrides={{
            Block: {
              style: {
                textTransform: 'uppercase',
                color: '#FFFFFF',
                fontFamily: 'Roboto Condensed Bold',
              },
            },
          }}
          marginBottom="30px"
        >
          Войти в учетную запись
        </Display4>
        <Formik
          initialValues={{ name: '', password: '' }}
          onSubmit={async (values, { setSubmitting, setErrors }) => {
            const response = await fetch(new URL('/api/login', 'http://localhost:3000').toString(), {
              method: 'POST',
              body: JSON.stringify(values),
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
            });

            const res = await response.json();

            if (res.status == 'fail') {
              setErrors({
                password: res.data.message,
                ...res.data,
              });
            } else {
              await router.push('/');
            }
            setSubmitting(false);
          }}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            errors,
            isSubmitting,
          }) => (
            <>
              <FormControl
                label="Имя команды"
                overrides={{
                  Label: {
                    style: {
                      textTransform: 'uppercase',
                      color: '#FFFFFF',
                      fontFamily: 'Roboto Condensed',
                    },
                  },
                }}
                error={errors.name}
              >
                <Input
                  onChange={(e) => handleChange(e)}
                  onBlur={(e) => handleBlur(e)}
                  name="name"
                  required
                />
              </FormControl>
              <FormControl
                label="Пароль"
                overrides={{
                  Label: {
                    style: {
                      textTransform: 'uppercase',
                      color: '#FFFFFF',
                      fontFamily: 'Roboto Condensed',
                    },
                  },
                }}
                error={errors.password}
              >
                <Input
                  onChange={(e) => handleChange(e)}
                  onBlur={(e) => handleBlur(e)}
                  type="password"
                  name="password"
                  required
                />
              </FormControl>
              <Button
                type="submit"
                onClick={(e) => handleSubmit(e)}
                isLoading={isSubmitting}
              >
                Авторизоваться
              </Button>
            </>
          )}
        </Formik>
      </Block>
      <Background />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const { config: { startMatchDate, endMatchDate, timer }, user } = req as any;
  const props: PageProps = {
    startMatchDate: startMatchDate ?? null,
    endMatchDate: endMatchDate ?? null,
    user: user ?? null,
  };

  if (user) {
    return ({
      redirect: {
        permanent: false,
        destination: '/',
      },
    });
  }

  return ({ props });
};

export default Page;
