import { Box, Container, makeStyles, Typography } from '@material-ui/core';
import { SpeedDial, SpeedDialAction } from '@material-ui/lab';
import * as React from 'react';
import DragMove from './components/DragMove';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';

interface Props {
  
}

const useStyles = makeStyles({
  root: {
    position: 'fixed',
    top: 0,
    left: 0,
    minWidth: '100vw',
    minHeight: '100vh',
    background: 'rgba(50,0,0,0.25)',
    pointerEvents: 'none'
  },
  speedDial: {
    position: 'fixed',
    bottom: 20,
    right: 20,
    zIndex: 1000000000
  },
  byoaButton: {

  }
});

// @ts-expect-error
export const ByoaSDK = (props : Props) => {
  const classes = useStyles();
  const [translateDial, setTranslateDial] = React.useState({
    x: 0,
    y: 0
  });
  const [dialDirection, setDialDirection] = React.useState<"left" | "right" | "up" | "down" | undefined>("up");
  const [openDial, setOpenDial] = React.useState(false);
  
  return (
    <Box className={classes.root}>
      <Container className={classes.speedDial}>
        <DragMove onDragMove={(e : any) => {
          setTranslateDial({
            x: translateDial.x + e.movementX,
            y: translateDial.y + e.movementY
          });
          if (e.clientY < 200) {
            if (dialDirection !== "down") setDialDirection("down");
          }
          if (e.clientY > 200) {
            if (dialDirection !== "up") setDialDirection("up");
          }
        }}>
          <SpeedDial
            style={{
              transform: `translateX(${translateDial.x}px) translateY(${translateDial.y}px)`
            }}
            ariaLabel="BYOA Speed Dial"
            hidden={false}
            icon={<Typography className={classes.byoaButton}>RUN</Typography>}
            open={openDial}
            onOpen={() => {
              setOpenDial(true);
            }}
            onClose={() => {
              setOpenDial(false);
            }}
            onClick={() => {
              
            }}
            direction={dialDirection}
          >
            <SpeedDialAction
              key={'sda-connect-wallet'}
              icon={<AccountBalanceWalletIcon />}
              tooltipTitle={'Connect Wallet'}
              onClick={() => {
                setOpenDial(false);
              }}
            />

          </SpeedDial>
        </DragMove>
          
      </Container>
    </Box>
  )
}
