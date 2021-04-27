import React from 'react';
import Link from 'next/link';
import { Block } from 'baseui/block';
import { useStyletron } from 'baseui';
import { motion } from 'framer-motion';

type Props = {
  href?: string,
  points?: any,
  children?: any,
  tip?: any,
};

const MainButton = ({
  href,
  children,
  points,
  tip,
}: Props) => {
  const [css] = useStyletron();

  return (
    <Link href={href} passHref>
      <motion.a
        className={css({
          position: 'relative',
          border: '2px solid #FFEF04',
          padding: '40px',
          height: '120px',
          display: 'block',
          cursor: 'pointer',
          textDecoration: 'none',
        })}
        transition={{
          duration: 0.1,
        }}
        variants={{
          hovered: {},
        }}
        whileHover="hovered"
      >
        <motion.div
          className={css({
            color: '#ffffff',
            textTransform: 'uppercase',
            fontFamily: 'Roboto Condensed Bold',
            fontSize: '44px',
            lineHeight: '52px',
            fontWeight: 500,
          })}
          transition={{
            duration: 0.1,
          }}
          variants={{
            hovered: {
              color: 'rgb(0, 0, 0)',
            },
          }}
        >
          {children}
        </motion.div>
        {points && (
          <Block
            className={css({
              background: '#FFEF04',
              position: 'absolute',
              color: 'black',
              bottom: '0',
              left: '0',
              padding: '10px 30px',
              fontSize: '23px',
              fontFamily: 'Roboto Condensed Bold',
            })}
          >
            {points}
          </Block>
        )}
        {tip && (
          <Block
            className={css({
              background: '#FFEF04',
              position: 'absolute',
              color: 'black',
              bottom: '0',
              right: '0',
              padding: '10px 30px',
              fontSize: '23px',
              fontFamily: 'Roboto Condensed Bold',
            })}
          >
            {tip}
          </Block>
        )}
        <motion.div
          className={css({
            position: 'absolute',
            width: '100%',
            height: 'calc(100% - 30px)',
            top: '15px',
            left: '15px',
            backgroundColor: '#FFEF04',
            zIndex: -1,
            opacity: 0,
          })}
          transition={{
            duration: 0.1,
          }}
          variants={{
            hovered: {
              opacity: 1,
            },
          }}
        />
      </motion.a>
    </Link>
  );
};

export default MainButton;
