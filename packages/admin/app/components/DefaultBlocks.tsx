import React from 'react';
import { useStyletron } from 'baseui';
import { Block, BlockProps } from 'baseui/block';
import NextLink from 'next/link';
import { StyledSpinnerNext } from 'baseui/spinner';
import { Cell, CellProps, Grid } from 'baseui/layout-grid';
import { Button, ButtonProps } from 'baseui/button';

type FullscreenBlockProps = BlockProps & { centered?: boolean }

const FullscreenBlock = ({ children, centered, ...props }: FullscreenBlockProps): JSX.Element => {
  const [, { colors }] = useStyletron();

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
  );
};

const FullscreenLoader = (): JSX.Element => {
  const [, { colors }] = useStyletron();

  return (
    <FullscreenBlock backgroundColor={colors.primaryB} centered>
      <StyledSpinnerNext />
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

const Card = ({ children, className, ...props }: BlockProps) => {
  const [, { colors }] = useStyletron();

  return (
    <Block
      backgroundColor={colors.backgroundPrimary}
      className={`px-10 py-8 shadow-2xl ${className}`}
      {...props}
    >
      {children}
    </Block>
  );
};

type ButtonLinkProps = React.PropsWithChildren<ButtonProps
  & React.RefAttributes<HTMLButtonElement>
  & { href?: string; className?: string }>

const ButtonLink = ({ href, children, className, ...props }: ButtonLinkProps) => {
  const NewButton = (
    <Button overrides={{ Root: { props: { className } } }} {...props}>
      {children}
    </Button>
  );

  return href ? (
    <NextLink href={href} passHref>
      <a className={className}>
        {NewButton}
      </a>
    </NextLink>
  ) : (NewButton);
};

export { FullscreenBlock, FullscreenLoader, Container, Card, ButtonLink };
