import React, { useState } from 'react';
import { Button } from 'baseui/button';
import { Block } from 'baseui/block';
import { useRouter } from 'next/router';
import { StatefulTooltip } from 'baseui/tooltip';
import { useStyletron } from 'baseui';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  Modal,
  SIZE,
  ROLE,
} from 'baseui/modal';
import { User } from 'moectf-core';
import Countdown from 'react-countdown';
import { faStopwatch } from '@fortawesome/free-solid-svg-icons';

type Props = {
  list: {
    icon: IconProp,
    tooltip: { 'ru-RU': string, 'en-US': string },
    url?: string,
    onClick?: any,
  }[],
  user: User,
  modalContent?: any,
  endMatchDate?: number,
  startMatchDate?: number,
  locale: string,
};

const Menu = ({
  list,
  user,
  modalContent,
  endMatchDate,
  startMatchDate,
  locale,
  ...rest
}: Props) => {
  const [css] = useStyletron();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {modalContent && (
        <Modal
          onClose={() => setIsOpen(false)}
          closeable
          isOpen={isOpen}
          animate
          autoFocus
          size={SIZE.default}
          role={ROLE.dialog}
        >
          {modalContent}
        </Modal>
      )}
      <Block
        display="flex"
        position="fixed"
        bottom="0"
        width="100%"
        height="60px"
        {...rest}
      >
        <Block
          display="flex"
          className={css({
            borderTop: '2px solid rgba(255, 255, 255, 0.1)',
          })}
          width="calc(50% - 70px)"
          height="58px"
        >
          {startMatchDate && endMatchDate && (
            <StatefulTooltip
              accessibilityType="tooltip"
              content={{ 'ru-RU': 'Оставшееся время', 'en-US': 'Lasting time' }[locale]}
            >
              <Block
                overrides={{
                  Block: {
                    style: {
                      borderRightWidth: '2px',
                      borderRightColor: 'rgba(255, 255, 255, 0.1)',
                      borderRightStyle: 'solid',
                      display: 'flex',
                      padding: '0 20px',
                      alignItems: 'center',
                    },
                  },
                }}
              >
                <FontAwesomeIcon icon={faStopwatch} color="#ffffff" />
                <span
                  className={css({
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    fontFamily: 'Roboto Condensed',
                    padding: '0 20px 0 30px',
                    display: 'flex',
                  })}
                >
                  <Countdown date={startMatchDate}>
                    <>
                      <Countdown date={endMatchDate}>
                        <Block>
                          {{ 'ru-RU': 'Игра закончилась', 'en-US': 'Game ended' }[locale]}
                        </Block>
                      </Countdown>
                      <Block
                        marginLeft="20px"
                      >
                        {{ 'ru-RU': 'Игра началась', 'en-US': 'Game started' }[locale]}
                      </Block>
                    </>
                  </Countdown>
                </span>
              </Block>
            </StatefulTooltip>
          )}
        </Block>
        <Block
          className={css({
            borderLeft: '2px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '90px',
            width: '20px',
          })}
          height="60px"
          marginTop="-30px"
        />
        <Block
          width="140px"
          height="60px"
          marginTop="-30px"
        >
          <motion.div
            style={{
              borderRadius: '90px',
              width: '60px',
              height: '60px',
              border: '2px solid #FFFFFF',
              margin: '0 auto',
              cursor: 'pointer',
            }}
            variants={{
              initial: {},
              hovered: {},
              tapped: {
                opacity: 0.6,
              },
            }}
            whileHover="hovered"
            whileTap="tapped"
            transition={{
              ease: 'easeOut',
              duration: 0.2,
            }}
            onClick={user.admin && (() => setIsOpen(!isOpen))}
          >
            <motion.div
              className={css({
                borderRadius: '0 0 90px 90px',
                margin: '30px 10px',
                width: '40px',
                height: '20px',
                background: '#FFFFFF',
              })}
              variants={{
                initial: {},
                hovered: {
                  borderRadius: '90px 90px 90px 90px',
                  height: '40px',
                  margin: '10px 10px',
                },
              }}
            />
          </motion.div>
        </Block>
        <Block
          className={css({
            borderRight: '2px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '90px',
            width: '20px',
          })}
          height="60px"
          marginTop="-30px"
        />
        <Block
          display="flex"
          className={css({
            borderTop: '2px solid rgba(255, 255, 255, 0.1)',
            justifyContent: 'flex-end',
          })}
          width="calc(50% - 70px)"
          height="58px"
        >
          {list?.map((button) => (
            <StatefulTooltip
              accessibilityType="tooltip"
              content={button.tooltip[locale]}
              key={button.tooltip[locale]}
            >
              <Button
                onClick={() => {
                  if (button.onClick) button.onClick(router);
                  if (button.url) router.push(button.url);
                }}
                overrides={{
                  Root: {
                    style: {
                      width: '80px',
                      borderLeftWidth: '2px',
                      borderLeftColor: 'rgba(255, 255, 255, 0.1)',
                      borderLeftStyle: 'solid',
                      backgroundColor: 'transparent',
                      transitionDuration: '0.2s',
                      ':hover': {
                        backgroundColor: '#0041F5',
                      },
                      ':active': {
                        backgroundColor: '#0036CC',
                      },
                    },
                  },
                }}
              >
                <FontAwesomeIcon icon={button.icon} color="#ffffff" />
              </Button>
            </StatefulTooltip>
          ))}
          <Block
            display="flex"
            alignItems="center"
            overrides={{
              Block: {
                style: {
                  color: '#ffffff',
                  textTransform: 'uppercase',
                  fontFamily: 'Roboto Condensed',
                  padding: '0 20px',
                  borderLeftWidth: '2px',
                  borderLeftColor: 'rgba(255, 255, 255, 0.1)',
                  borderLeftStyle: 'solid',
                },
              },
            }}
          >
            {user.name}
          </Block>
        </Block>
      </Block>
    </>
  );
};

export default Menu;
