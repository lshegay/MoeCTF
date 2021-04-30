import React from 'react';
import {
  ModalHeader,
  ModalBody,
} from 'baseui/modal';

const Userrules = ({ locale }) => (
  <>
    <ModalHeader>
      {{
        'ru-RU': 'Поздравляем ня! Вы победили ня! Вот Ваш подарок ня!!!',
        'en-US': 'Congratulations nya! You have won nya! Here is your gift nya!!!',
      }[locale]}
    </ModalHeader>
    <ModalBody>
      <iframe
        width="560"
        height="315"
        src="https://www.youtube-nocookie.com/embed/mGROTgYJJaM?controls=0"
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </ModalBody>
  </>
);

export default Userrules;
