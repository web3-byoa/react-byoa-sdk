import { makeStyles, Box, Container, Typography } from '@material-ui/core';
import { SpeedDial, SpeedDialAction } from '@material-ui/lab';
import React__default, { useState, createElement } from 'react';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';

function DragMove(props) {
  var onPointerDown = props.onPointerDown,
      onPointerUp = props.onPointerUp,
      onPointerMove = props.onPointerMove,
      onDragMove = props.onDragMove,
      children = props.children,
      style = props.style,
      className = props.className;

  var _useState = useState(false),
      isDragging = _useState[0],
      setIsDragging = _useState[1];

  var handlePointerDown = function handlePointerDown(e) {
    setIsDragging(true);
    onPointerDown(e);
  };

  var handlePointerUp = function handlePointerUp(e) {
    setIsDragging(false);
    onPointerUp(e);
  };

  var handlePointerMove = function handlePointerMove(e) {
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
  onPointerDown: function onPointerDown() {},
  onPointerUp: function onPointerUp() {},
  onPointerMove: function onPointerMove() {}
};

var useStyles = makeStyles({
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
var ByoaSDK = function ByoaSDK(props) {
  var classes = useStyles();

  var _React$useState = useState({
    x: 0,
    y: 0
  }),
      translateDial = _React$useState[0],
      setTranslateDial = _React$useState[1];

  var _React$useState2 = useState("up"),
      dialDirection = _React$useState2[0],
      setDialDirection = _React$useState2[1];

  var _React$useState3 = useState(false),
      openDial = _React$useState3[0],
      setOpenDial = _React$useState3[1];

  return createElement(Box, {
    className: classes.root
  }, createElement(Container, {
    className: classes.speedDial
  }, createElement(DragMove, {
    onDragMove: function onDragMove(e) {
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
      transform: "translateX(" + translateDial.x + "px) translateY(" + translateDial.y + "px)"
    },
    ariaLabel: "BYOA Speed Dial",
    hidden: false,
    icon: createElement(Typography, {
      className: classes.byoaButton
    }, "RUN"),
    open: openDial,
    onOpen: function onOpen() {
      setOpenDial(true);
    },
    onClose: function onClose() {
      setOpenDial(false);
    },
    onClick: function onClick() {},
    direction: dialDirection
  }, createElement(SpeedDialAction, {
    key: 'sda-connect-wallet',
    icon: createElement(AccountBalanceWalletIcon, null),
    tooltipTitle: 'Connect Wallet',
    onClick: function onClick() {
      setOpenDial(false);
    }
  })))));
};

export { ByoaSDK };
//# sourceMappingURL=index.modern.js.map
