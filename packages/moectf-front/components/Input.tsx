import React from 'react';
import { Input as BaseInput } from 'baseui/input';

const Input = (props) => (
  <BaseInput
    {...props}
    overrides={{
      Root: {
        style: {
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderBottomColor: 'transparent',
          borderTopColor: 'transparent',
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          outline: '2px #FFEF04 solid',
          transitionProperty: 'background',
          transitionDuration: '0.1s',

          ':hover': {
            backgroundColor: 'rgb(255, 239, 4, 0.4)',
          },
        },
      },
      InputContainer: {
        style: {
          backgroundColor: 'transparent',
        },
      },
      Input: {
        style: {
          backgroundColor: 'transparent',
          color: 'white',
          fontFamily: 'Roboto Condensed',
          textShadow: '0 0 30px #FFEF04',
        },
      },
      MaskToggleButton: {
        style: {
          color: 'white',
          textShadow: '0 0 30px #FFEF04',
        },
      },
    }}
  />
);

export default Input;
