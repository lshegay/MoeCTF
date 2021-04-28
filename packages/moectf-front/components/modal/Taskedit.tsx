import React from 'react';
import {
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalButton,
} from 'baseui/modal';
import { Input as ModalInput } from 'baseui/input';
import { Formik } from 'formik';
import { useRouter } from 'next/router';
import { FormControl } from 'baseui/form-control';

const Taskedit = ({ task, category, domain }) => {
  const router = useRouter();

  return (
    <>
      <ModalHeader>Изменение таска</ModalHeader>
      <Formik
        initialValues={{
          name: task.name,
          content: task.content,
          flag: null,
          points: task.points,
          file: null,
        }}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          const form = new FormData();
          Object.keys(values).forEach((key) => form.append(key, values[key]));
          form.append('categoryId', category._id);

          const response = await fetch(new URL(`/api/admin/tasks/${task._id}`, domain).toString(), {
            method: 'PUT',
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
            router.push(`/tasks/${task._id}`);
          }

          setSubmitting(false);
        }}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
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
                <ModalInput
                  onChange={(e) => handleChange(e)}
                  onBlur={(e) => handleBlur(e)}
                  name="name"
                  value={values.name}
                />
              </FormControl>
              <FormControl
                label="Контент"
                error={errors.flag}
              >
                <ModalInput
                  onChange={(e) => handleChange(e)}
                  onBlur={(e) => handleBlur(e)}
                  name="content"
                  value={values.content}
                />
              </FormControl>
              <FormControl
                label="Флаг"
                error={errors.flag}
              >
                <ModalInput
                  onChange={(e) => handleChange(e)}
                  onBlur={(e) => handleBlur(e)}
                  name="flag"
                />
              </FormControl>
              <FormControl
                label="Очки"
                error={errors.points}
              >
                <ModalInput
                  onChange={(e) => handleChange(e)}
                  onBlur={(e) => handleBlur(e)}
                  name="points"
                  type="number"
                  value={values.points}
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
                Изменить таск
              </ModalButton>
              <ModalButton
                onClick={async () => {
                  const response = await fetch(new URL(`/api/admin/tasks/${task._id}`, domain).toString(), {
                    method: 'DELETE',
                    headers: {
                      Accept: 'application/json',
                    },
                  });

                  await response.json();
                  await router.push(`/category/${category._id}`);
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
                Удалить таск
              </ModalButton>
            </ModalFooter>
          </>
        )}
      </Formik>
    </>
  );
};

export default Taskedit;
