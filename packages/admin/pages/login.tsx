import { Response, Status } from 'moectf-core/response';
import React from 'react';
import { useRouter } from 'next/router';
import { Form, Formik } from 'formik';
import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { Heading, HeadingLevel } from 'baseui/heading';
import { LabelMedium } from 'baseui/typography';
import { Button } from 'baseui/button';
import { Input } from 'baseui/input';
import { FormControl } from 'baseui/form-control';
import routes, { getProfile } from '@utils/routes';
import { FullscreenBlock, FullscreenLoader } from '@components/DefaultBlocks';

type AuthFormValues = { name: string; password: string }

const formValidate = (values: AuthFormValues): Partial<AuthFormValues> => {
  const errors: Partial<AuthFormValues> = {};

  if (values.name == '') {
    errors.name = 'Please provide a user name.';
  }

  if (values.password == '') {
    errors.password = 'Please provide a password.';
  }

  return errors;
};

const Page = (): JSX.Element => {
  const { user, isValidating } = getProfile();
  const [, { colors }] = useStyletron();
  const router = useRouter();

  if (isValidating || user) {
    if (user) router.push('/');

    return (<FullscreenLoader />);
  }

  return (
    <FullscreenBlock backgroundColor={colors.primaryB} display="flex" flexDirection="row">
      <Block
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        width={['100%', '100%', '550px']}
      >
        <Block width={['90%', '90%', '70%']}>
          <Formik
            initialValues={{
              name: '',
              password: '',
            }}
            validate={formValidate}
            onSubmit={async (values, { setSubmitting, setErrors }): Promise<void> => {
              const res = await fetch(routes.login, {
                method: 'POST',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(values),
              });

              const response: Response<AuthFormValues> = await res.json();
              if (response.status == Status.SUCCESS) {
                router.push('/');
              } else {
                setErrors(response.data);
              }

              setSubmitting(false);
            }}
          >
            {({
              values,
              errors,
              submitForm,
              isSubmitting,
              handleChange,
            }): JSX.Element => (
              <Form
                className="flex flex-col"
              >
                <HeadingLevel>
                  <div className="text-center">
                    <Heading>Welcome back!</Heading>
                    <LabelMedium
                      color={colors.contentSecondary}
                      marginBottom="40px"
                    >
                      Login to manage CTF settings.
                    </LabelMedium>
                  </div>
                  <FormControl label="Name" error={errors.name}>
                    <Input
                      name="name"
                      value={values.name}
                      onChange={handleChange}
                      placeholder="Your Name"
                    />
                  </FormControl>
                  <FormControl label="Password" error={errors.password}>
                    <Input
                      name="password"
                      value={values.password}
                      onChange={handleChange}
                      type="password"
                      placeholder="Your Password"
                    />
                  </FormControl>
                  <Button
                    onClick={submitForm}
                    isLoading={isSubmitting}
                  >
                    Sign in
                  </Button>
                </HeadingLevel>
              </Form>
            )}
          </Formik>
        </Block>
      </Block>
      <Block
        backgroundImage="url(background.jpg)"
        backgroundSize="cover"
        backgroundRepeat="no-repeat"
        width={['0', '0', 'calc(100% - 550px)']}
      />
    </FullscreenBlock>
  );
};

export default Page;
