import React from 'react';
import { Button as BaseButton } from 'baseui/button';

const Button = (props) => (
  <BaseButton
    {...props}
    overrides={{
      BaseButton: {
        style: {
          outline: '2px #FFEF04 solid',
          backgroundColor: 'transparent',
          textTransform: 'uppercase',
          color: '#FFFFFF',
          fontFamily: 'Roboto Condensed Bold',
          transitionDuration: '0.1s',
          ':hover': {
            backgroundColor: 'rgb(255, 239, 4, 0.4)',
          },
          ':active': {
            backgroundColor: 'rgb(255, 239, 4, 0.6)',
          },
        },
      },
    }}
  />
);

export default Button;
