import React from 'react';
import {
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalButton,
} from 'baseui/modal';
import { Input } from 'baseui/input';
import { Formik } from 'formik';
import { useRouter } from 'next/router';
import { FormControl } from 'baseui/form-control';

const Taskcreate = ({ category, domain }) => {
  const router = useRouter();

  return (
    <>
      <ModalHeader>Добавление тасков</ModalHeader>
      <Formik
        initialValues={{
          name: '',
          contentRu: '',
          contentEn: '',
          flag: '',
          points: 0,
          file: null,
        }}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          const form = new FormData();
          Object.keys(values).forEach((key) => form.append(key, values[key]));
          form.append('categoryId', category._id);
          form.append('content', JSON.stringify({
            'ru-RU': values.contentRu,
            'en-US': values.contentEn,
          }));

          const response = await fetch(new URL('/api/admin/tasks', domain).toString(), {
            method: 'POST',
            body: form,
            headers: {
              Accept: 'application/json',
            },
          });

          const res = await response.json();

          if (res.status == 'fail') {
            setErrors({
              file: res.data.message,
              ...res.data,
            });
          } else {
            router.push(`/category/${category._id}`);
          }

          setSubmitting(false);
        }}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          errors,
          setFieldValue,
          isSubmitting,
        }) => (
          <>
            <ModalBody>
              <FormControl
                label="Имя"
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
                label="Контент Русский"
                error={errors.flag}
              >
                <Input
                  onChange={(e) => handleChange(e)}
                  onBlur={(e) => handleBlur(e)}
                  name="contentRu"
                  required
                />
              </FormControl>
              <FormControl
                label="Контент Английский"
                error={errors.flag}
              >
                <Input
                  onChange={(e) => handleChange(e)}
                  onBlur={(e) => handleBlur(e)}
                  name="contentEn"
                  required
                />
              </FormControl>
              <FormControl
                label="Флаг"
                error={errors.flag}
              >
                <Input
                  onChange={(e) => handleChange(e)}
                  onBlur={(e) => handleBlur(e)}
                  name="flag"
                  required
                />
              </FormControl>
              <FormControl
                label="Очки"
                error={errors.points}
              >
                <Input
                  onChange={(e) => handleChange(e)}
                  onBlur={(e) => handleBlur(e)}
                  name="points"
                  type="number"
                  required
                />
              </FormControl>
              <FormControl
                label="Файл"
                error={errors.file}
              >
                <input
                  name="file"
                  type="file"
                  onChange={(event) => {
                    setFieldValue('file', event.currentTarget.files[0]);
                  }}
                />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <ModalButton
                type="submit"
                onClick={() => handleSubmit()}
                isLoading={isSubmitting}
              >
                Добавить новый таск
              </ModalButton>
              <ModalButton
                onClick={async () => {
                  const response = await fetch(new URL(`/api/admin/categories/${category._id}`, domain).toString(), {
                    method: 'DELETE',
                    headers: {
                      Accept: 'application/json',
                    },
                  });

                  await response.json();
                  await router.push('/');
                }}
                isLoading={isSubmitting}
                overrides={{
                  BaseButton: {
                    style: {
                      backgroundColor: 'red',
                    },
                  },
                }}
              >
                Удалить категорию
              </ModalButton>
            </ModalFooter>
          </>
        )}
      </Formik>
    </>
  );
};

export default Taskcreate;
