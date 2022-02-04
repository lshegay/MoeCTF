import React from 'react';
import { useStyletron } from 'baseui';
import { Block, BlockProps } from 'baseui/block';
// eslint-disable-next-line baseui/deprecated-component-api
import { Spinner } from 'baseui/spinner';
import { Cell, CellProps, Grid } from 'baseui/layout-grid';

type FullscreenBlockProps = BlockProps & { centered?: boolean }

const FullscreenBlock = ({ children, centered, ...props }: FullscreenBlockProps): JSX.Element => {
  const [_, { colors }] = useStyletron();

  return (
    <Block
      width="100%"
      height="100vh"
      backgroundColor={colors.primaryB}
      {...(centered ? { display: 'flex', alignItems: 'center', justifyContent: 'center' } : {})}
      {...props}
    >
      {children}
    </Block>
  )
};

const FullscreenLoader = (): JSX.Element => {
  const [_, { colors }] = useStyletron();

  return (
    <FullscreenBlock backgroundColor={colors.primaryB} centered>
      <Spinner />
    </FullscreenBlock>
  );
};

const Container = ({ children, ...props }: CellProps): JSX.Element => (
  <Grid>
    <Cell
      span={[12, 12, 12]}
      {...props}
    >
      {children}
    </Cell>
  </Grid>
);

export { FullscreenBlock, FullscreenLoader, Container };
