import React from 'react';
import { Block } from 'baseui/block';
import { useStyletron } from 'baseui';

const Background = () => {
  const [css] = useStyletron();

  return (
    <>
      <Block
        backgroundColor="#000000"
        width="100%"
        height="100vh"
        position="fixed"
        top="0"
        left="0"
        className={css({
          zIndex: -2,
        })}
      >
        <Block
          className={css({
            backgroundImage: 'url(/background.jpg)',
            backgroundPosition: 'center',
            backgroundRepeat: 'initial',
            backgroundSize: 'cover',
            opacity: 0.9,
            alignItems: 'center',
            boxShadow: 'rgb(0 0 0 / 30%) 0px 0px 58px 53px inset',
          })}
          height="100%"
        />
      </Block>
    </>
  );
};

export default Background;
