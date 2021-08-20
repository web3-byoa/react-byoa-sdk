function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var core = require('@material-ui/core');
var lab = require('@material-ui/lab');
var React = require('react');
var React__default = _interopDefault(React);
var AccountBalanceWalletIcon = _interopDefault(require('@material-ui/icons/AccountBalanceWallet'));

function DragMove(props) {
  var onPointerDown = props.onPointerDown,
      onPointerUp = props.onPointerUp,
      onPointerMove = props.onPointerMove,
      onDragMove = props.onDragMove,
      children = props.children,
      style = props.style,
      className = props.className;

  var _useState = React.useState(false),
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

var useStyles = core.makeStyles({
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

  var _React$useState = React.useState({
    x: 0,
    y: 0
  }),
      translateDial = _React$useState[0],
      setTranslateDial = _React$useState[1];

  var _React$useState2 = React.useState("up"),
      dialDirection = _React$useState2[0],
      setDialDirection = _React$useState2[1];

  var _React$useState3 = React.useState(false),
      openDial = _React$useState3[0],
      setOpenDial = _React$useState3[1];

  return React.createElement(core.Box, {
    className: classes.root
  }, React.createElement(core.Container, {
    className: classes.speedDial
  }, React.createElement(DragMove, {
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
  }, React.createElement(lab.SpeedDial, {
    style: {
      transform: "translateX(" + translateDial.x + "px) translateY(" + translateDial.y + "px)"
    },
    ariaLabel: "BYOA Speed Dial",
    hidden: false,
    icon: React.createElement(core.Typography, {
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
  }, React.createElement(lab.SpeedDialAction, {
    key: 'sda-connect-wallet',
    icon: React.createElement(AccountBalanceWalletIcon, null),
    tooltipTitle: 'Connect Wallet',
    onClick: function onClick() {
      setOpenDial(false);
    }
  })))));
};

exports.ByoaSDK = ByoaSDK;
//# sourceMappingURL=index.js.map
