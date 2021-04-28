import React from 'react';
import {
  ModalHeader,
  ModalBody,
} from 'baseui/modal';
import { Input } from 'baseui/input';
import { Formik } from 'formik';
import { useRouter } from 'next/router';
import { FormControl } from 'baseui/form-control';
import { Button } from 'baseui/button';

const Categorycreate = ({ domain }) => {
  const router = useRouter();

  return (
    <>
      <ModalHeader>Добавление категорий</ModalHeader>
      <ModalBody>
        <Formik
          initialValues={{ name: '' }}
          onSubmit={async (values, { setSubmitting, setErrors }) => {
            const response = await fetch(new URL('/api/admin/categories', domain).toString(), {
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
                name: res.data.message,
                ...res.data,
              });
            } else {
              router.push('/');
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
                label="Имя новой категории"
                error={errors.name}
              >
                <Input
                  onChange={(e) => handleChange(e)}
                  onBlur={(e) => handleBlur(e)}
                  name="name"
                  required
                />
              </FormControl>
              <Button
                type="submit"
                onClick={() => handleSubmit()}
                isLoading={isSubmitting}
              >
                Добавить новую категории
              </Button>
            </>
          )}
        </Formik>
      </ModalBody>
    </>
  );
};

export default Categorycreate;
