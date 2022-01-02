import React from 'react';
import { css } from '@emotion/css';
import Styles from '@utils/styles';

type ContainerProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

const Container = (props: ContainerProps): JSX.Element => (
  <div
    className={css(`
      max-width: ${Styles.container.maxWidth};
      margin: 0 auto;
      display: flex;
      -webkit-box-align: center;
      align-items: center;
      -webkit-box-pack: justify;
      justify-content: space-between;
    `)}
    {...props}
  />
);

export default Container;
