import { makeStyles, Box, Container, Typography } from '@material-ui/core';
import { SpeedDial, SpeedDialAction } from '@material-ui/lab';
import React__default, { useState, createElement } from 'react';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';

function DragMove(props) {
  const {
    onPointerDown,
    onPointerUp,
    onPointerMove,
    onDragMove,
    children,
    style,
    className
  } = props;
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = e => {
    setIsDragging(true);
    onPointerDown(e);
  };

  const handlePointerUp = e => {
    setIsDragging(false);
    onPointerUp(e);
  };

  const handlePointerMove = e => {
    if (isDragging) onDragMove(e);
    onPointerMove(e);
  };

  return React__default.createElement("div", {
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerUp,
    onPointerMove: handlePointerMove,
    style: style,
    className: className
  }, children);
}
DragMove.defaultProps = {
  onPointerDown: () => {},
  onPointerUp: () => {},
  onPointerMove: () => {}
};

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
  byoaButton: {}
});
const ByoaSDK = props => {
  const classes = useStyles();
  const [translateDial, setTranslateDial] = useState({
    x: 0,
    y: 0
  });
  const [dialDirection, setDialDirection] = useState("up");
  const [openDial, setOpenDial] = useState(false);
  return createElement(Box, {
    className: classes.root
  }, createElement(Container, {
    className: classes.speedDial
  }, createElement(DragMove, {
    onDragMove: e => {
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
    }
  }, createElement(SpeedDial, {
    style: {
      transform: `translateX(${translateDial.x}px) translateY(${translateDial.y}px)`
    },
    ariaLabel: "BYOA Speed Dial",
    hidden: false,
    icon: createElement(Typography, {
      className: classes.byoaButton
    }, "RUN"),
    open: openDial,
    onOpen: () => {
      setOpenDial(true);
    },
    onClose: () => {
      setOpenDial(false);
    },
    onClick: () => {},
    direction: dialDirection
  }, createElement(SpeedDialAction, {
    key: 'sda-connect-wallet',
    icon: createElement(AccountBalanceWalletIcon, null),
    tooltipTitle: 'Connect Wallet',
    onClick: () => {
      setOpenDial(false);
    }
  })))));
};

export { ByoaSDK };
//# sourceMappingURL=index.modern.js.map
