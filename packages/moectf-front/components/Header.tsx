import React from 'react';
import { Block } from 'baseui/block';
import { useStyletron } from 'baseui';
import { Display4 } from 'baseui/typography';
import Link from 'next/link';

type Props = {
  title: string,
  subtitle?: string,
  hrefSubtitle?: string,
};

const Header = ({ title, subtitle, hrefSubtitle }: Props) => {
  const [css] = useStyletron();

  return (
    <>
      <Block
        position="fixed"
        top="0"
        left="0"
        display="flex"
        width="100%"
      >
        <Link href="/">
          <a
            className={css({
              textDecoration: 'none',
            })}
          >
            <Display4
              overrides={{
                Block: {
                  style: {
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    fontFamily: 'Roboto Condensed',
                    marginTop: '60px',
                    marginBottom: '60px',
                    marginLeft: '60px',
                    ':hover': {
                      color: '#cccccc',
                    },
                  },
                },
              }}
            >
              {title}
            </Display4>
          </a>
        </Link>
        {subtitle && (
          <Link href={hrefSubtitle}>
            <a
              className={css({
                textDecoration: 'none',
              })}
            >
              <Display4
                overrides={{
                  Block: {
                    style: {
                      color: '#ffffff',
                      textTransform: 'uppercase',
                      fontFamily: 'Roboto Condensed Bold',
                      marginTop: '60px',
                      marginBottom: '60px',
                      marginLeft: '15px',
                      ':hover': {
                        color: '#cccccc',
                      },
                    },
                  },
                }}
              >
                {`> ${subtitle}`}
              </Display4>
            </a>
          </Link>
        )}
      </Block>
    </>
  );
};

export default Header;
