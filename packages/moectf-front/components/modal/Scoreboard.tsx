import React from 'react';
import {
  ModalHeader,
  ModalBody,
} from 'baseui/modal';
import { FormControl } from 'baseui/form-control';
import { Textarea } from 'baseui/textarea';

const Categorycreate = ({ ctfTime }) => (
  <>
    <ModalHeader>Прочая информация</ModalHeader>
    <ModalBody>
      <FormControl
        label="CTFTime инфа"
      >
        <Textarea
          value={JSON.stringify(ctfTime)}
          size="large"
        />
      </FormControl>
    </ModalBody>
  </>
);

export default Categorycreate;
