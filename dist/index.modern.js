import { makeStyles, Box, Container, CircularProgress } from '@material-ui/core';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import MenuIcon from '@material-ui/icons/Menu';
import { SpeedDial, SpeedDialAction } from '@material-ui/lab';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { BigNumber, ethers } from 'ethers';
import React__default, { useState, useEffect, createElement } from 'react';
import Web3 from 'web3';
import Web3Modal from 'web3modal';
import buffer from 'buffer';
import { getStarknet } from '@argent/get-starknet';

// A type of promise-like that resolves synchronously and supports only one observer
const _Pact = /*#__PURE__*/(function() {
	function _Pact() {}
	_Pact.prototype.then = function(onFulfilled, onRejected) {
		const result = new _Pact();
		const state = this.s;
		if (state) {
			const callback = state & 1 ? onFulfilled : onRejected;
			if (callback) {
				try {
					_settle(result, 1, callback(this.v));
				} catch (e) {
					_settle(result, 2, e);
				}
				return result;
			} else {
				return this;
			}
		}
		this.o = function(_this) {
			try {
				const value = _this.v;
				if (_this.s & 1) {
					_settle(result, 1, onFulfilled ? onFulfilled(value) : value);
				} else if (onRejected) {
					_settle(result, 1, onRejected(value));
				} else {
					_settle(result, 2, value);
				}
			} catch (e) {
				_settle(result, 2, e);
			}
		};
		return result;
	};
	return _Pact;
})();

// Settles a pact synchronously
function _settle(pact, state, value) {
	if (!pact.s) {
		if (value instanceof _Pact) {
			if (value.s) {
				if (state & 1) {
					state = value.s;
				}
				value = value.v;
			} else {
				value.o = _settle.bind(null, pact, state);
				return;
			}
		}
		if (value && value.then) {
			value.then(_settle.bind(null, pact, state), _settle.bind(null, pact, 2));
			return;
		}
		pact.s = state;
		pact.v = value;
		const observer = pact.o;
		if (observer) {
			observer(pact);
		}
	}
}

function _isSettledPact(thenable) {
	return thenable instanceof _Pact && thenable.s & 1;
}

// Asynchronously iterate through an object that has a length property, passing the index as the first argument to the callback (even as the length property changes)
function _forTo(array, body, check) {
	var i = -1, pact, reject;
	function _cycle(result) {
		try {
			while (++i < array.length && (!check || !check())) {
				result = body(i);
				if (result && result.then) {
					if (_isSettledPact(result)) {
						result = result.v;
					} else {
						result.then(_cycle, reject || (reject = _settle.bind(null, pact = new _Pact(), 2)));
						return;
					}
				}
			}
			if (pact) {
				_settle(pact, 1, result);
			} else {
				pact = result;
			}
		} catch (e) {
			_settle(pact || (pact = new _Pact()), 2, e);
		}
	}
	_cycle();
	return pact;
}

const _iteratorSymbol = /*#__PURE__*/ typeof Symbol !== "undefined" ? (Symbol.iterator || (Symbol.iterator = Symbol("Symbol.iterator"))) : "@@iterator";

const _asyncIteratorSymbol = /*#__PURE__*/ typeof Symbol !== "undefined" ? (Symbol.asyncIterator || (Symbol.asyncIterator = Symbol("Symbol.asyncIterator"))) : "@@asyncIterator";

// Asynchronously implement a generic for loop
function _for(test, update, body) {
	var stage;
	for (;;) {
		var shouldContinue = test();
		if (_isSettledPact(shouldContinue)) {
			shouldContinue = shouldContinue.v;
		}
		if (!shouldContinue) {
			return result;
		}
		if (shouldContinue.then) {
			stage = 0;
			break;
		}
		var result = body();
		if (result && result.then) {
			if (_isSettledPact(result)) {
				result = result.s;
			} else {
				stage = 1;
				break;
			}
		}
		if (update) {
			var updateValue = update();
			if (updateValue && updateValue.then && !_isSettledPact(updateValue)) {
				stage = 2;
				break;
			}
		}
	}
	var pact = new _Pact();
	var reject = _settle.bind(null, pact, 2);
	(stage === 0 ? shouldContinue.then(_resumeAfterTest) : stage === 1 ? result.then(_resumeAfterBody) : updateValue.then(_resumeAfterUpdate)).then(void 0, reject);
	return pact;
	function _resumeAfterBody(value) {
		result = value;
		do {
			if (update) {
				updateValue = update();
				if (updateValue && updateValue.then && !_isSettledPact(updateValue)) {
					updateValue.then(_resumeAfterUpdate).then(void 0, reject);
					return;
				}
			}
			shouldContinue = test();
			if (!shouldContinue || (_isSettledPact(shouldContinue) && !shouldContinue.v)) {
				_settle(pact, 1, result);
				return;
			}
			if (shouldContinue.then) {
				shouldContinue.then(_resumeAfterTest).then(void 0, reject);
				return;
			}
			result = body();
			if (_isSettledPact(result)) {
				result = result.v;
			}
		} while (!result || !result.then);
		result.then(_resumeAfterBody).then(void 0, reject);
	}
	function _resumeAfterTest(shouldContinue) {
		if (shouldContinue) {
			result = body();
			if (result && result.then) {
				result.then(_resumeAfterBody).then(void 0, reject);
			} else {
				_resumeAfterBody(result);
			}
		} else {
			_settle(pact, 1, result);
		}
	}
	function _resumeAfterUpdate() {
		if (shouldContinue = test()) {
			if (shouldContinue.then) {
				shouldContinue.then(_resumeAfterTest).then(void 0, reject);
			} else {
				_resumeAfterTest(shouldContinue);
			}
		} else {
			_settle(pact, 1, result);
		}
	}
}

// Asynchronously call a function and send errors to recovery continuation
function _catch(body, recover) {
	try {
		var result = body();
	} catch(e) {
		return recover(e);
	}
	if (result && result.then) {
		return result.then(void 0, recover);
	}
	return result;
}

// Asynchronously await a promise and pass the result to a finally continuation
function _finallyRethrows(body, finalizer) {
	try {
		var result = body();
	} catch (e) {
		return finalizer(true, e);
	}
	if (result && result.then) {
		return result.then(finalizer.bind(null, false), finalizer.bind(null, true));
	}
	return finalizer(false, result);
}

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

var _format = "hh-sol-artifact-1";
var contractName = "Byoa";
var sourceName = "contracts/byoa.sol";
var abi = [
	{
		inputs: [
		],
		stateMutability: "nonpayable",
		type: "constructor"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "owner",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "approved",
				type: "address"
			},
			{
				indexed: true,
				internalType: "uint256",
				name: "tokenId",
				type: "uint256"
			}
		],
		name: "Approval",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "owner",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "operator",
				type: "address"
			},
			{
				indexed: false,
				internalType: "bool",
				name: "approved",
				type: "bool"
			}
		],
		name: "ApprovalForAll",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "role",
				type: "bytes32"
			},
			{
				indexed: true,
				internalType: "bytes32",
				name: "previousAdminRole",
				type: "bytes32"
			},
			{
				indexed: true,
				internalType: "bytes32",
				name: "newAdminRole",
				type: "bytes32"
			}
		],
		name: "RoleAdminChanged",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "role",
				type: "bytes32"
			},
			{
				indexed: true,
				internalType: "address",
				name: "account",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "sender",
				type: "address"
			}
		],
		name: "RoleGranted",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "role",
				type: "bytes32"
			},
			{
				indexed: true,
				internalType: "address",
				name: "account",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "sender",
				type: "address"
			}
		],
		name: "RoleRevoked",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				indexed: true,
				internalType: "uint256",
				name: "tokenId",
				type: "uint256"
			}
		],
		name: "Transfer",
		type: "event"
	},
	{
		inputs: [
		],
		name: "DEFAULT_ADMIN_ROLE",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "DEVELOPER_ROLE",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "tokenId",
				type: "uint256"
			}
		],
		name: "approve",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "owner",
				type: "address"
			}
		],
		name: "balanceOf",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "string",
				name: "a",
				type: "string"
			},
			{
				internalType: "string",
				name: "b",
				type: "string"
			}
		],
		name: "compareStrings",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "pure",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "string",
				name: "name",
				type: "string"
			},
			{
				internalType: "string",
				name: "description",
				type: "string"
			},
			{
				internalType: "uint256",
				name: "price",
				type: "uint256"
			},
			{
				internalType: "string",
				name: "_tokenURI",
				type: "string"
			}
		],
		name: "createApp",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "appId",
				type: "uint256"
			}
		],
		name: "getAppDetailsById",
		outputs: [
			{
				internalType: "string",
				name: "name",
				type: "string"
			},
			{
				internalType: "string",
				name: "description",
				type: "string"
			},
			{
				internalType: "string",
				name: "_tokenURI",
				type: "string"
			},
			{
				internalType: "address",
				name: "owner",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "price",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "_tokenId",
				type: "uint256"
			}
		],
		name: "getAppIdByTokenId",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "getAppIds",
		outputs: [
			{
				internalType: "uint256[]",
				name: "",
				type: "uint256[]"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "_appId",
				type: "uint256"
			}
		],
		name: "getApprovalByAppId",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "tokenId",
				type: "uint256"
			}
		],
		name: "getApproved",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "_tokenId",
				type: "uint256"
			},
			{
				internalType: "string",
				name: "key",
				type: "string"
			}
		],
		name: "getPreferenceByKey",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "_tokenId",
				type: "uint256"
			}
		],
		name: "getPreferencesKeys",
		outputs: [
			{
				internalType: "string[]",
				name: "",
				type: "string[]"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "role",
				type: "bytes32"
			}
		],
		name: "getRoleAdmin",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "role",
				type: "bytes32"
			},
			{
				internalType: "address",
				name: "account",
				type: "address"
			}
		],
		name: "grantRole",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "role",
				type: "bytes32"
			},
			{
				internalType: "address",
				name: "account",
				type: "address"
			}
		],
		name: "hasRole",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "owner",
				type: "address"
			},
			{
				internalType: "address",
				name: "operator",
				type: "address"
			}
		],
		name: "isApprovedForAll",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "_appId",
				type: "uint256"
			}
		],
		name: "mint",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "name",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "tokenId",
				type: "uint256"
			}
		],
		name: "ownerOf",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "role",
				type: "bytes32"
			},
			{
				internalType: "address",
				name: "account",
				type: "address"
			}
		],
		name: "renounceRole",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "role",
				type: "bytes32"
			},
			{
				internalType: "address",
				name: "account",
				type: "address"
			}
		],
		name: "revokeRole",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "tokenId",
				type: "uint256"
			}
		],
		name: "safeTransferFrom",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "tokenId",
				type: "uint256"
			},
			{
				internalType: "bytes",
				name: "_data",
				type: "bytes"
			}
		],
		name: "safeTransferFrom",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "_appId",
				type: "uint256"
			},
			{
				internalType: "bool",
				name: "_appr",
				type: "bool"
			}
		],
		name: "setApprovalByAppId",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "operator",
				type: "address"
			},
			{
				internalType: "bool",
				name: "approved",
				type: "bool"
			}
		],
		name: "setApprovalForAll",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bool",
				name: "_shouldOnboard",
				type: "bool"
			}
		],
		name: "setDeveloperOnboarding",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes4",
				name: "interfaceId",
				type: "bytes4"
			}
		],
		name: "supportsInterface",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "symbol",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "index",
				type: "uint256"
			}
		],
		name: "tokenByIndex",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "owner",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "index",
				type: "uint256"
			}
		],
		name: "tokenOfOwnerByIndex",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "tokenId",
				type: "uint256"
			}
		],
		name: "tokenURI",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "totalSupply",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "tokenId",
				type: "uint256"
			}
		],
		name: "transferFrom",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "appId",
				type: "uint256"
			},
			{
				internalType: "string",
				name: "name",
				type: "string"
			},
			{
				internalType: "string",
				name: "description",
				type: "string"
			},
			{
				internalType: "uint256",
				name: "price",
				type: "uint256"
			},
			{
				internalType: "string",
				name: "_tokenURI",
				type: "string"
			}
		],
		name: "updateApp",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "_tokenID",
				type: "uint256"
			},
			{
				internalType: "string",
				name: "key",
				type: "string"
			},
			{
				internalType: "string",
				name: "value",
				type: "string"
			}
		],
		name: "updatePreferences",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "_owner",
				type: "address"
			}
		],
		name: "walletOfOwner",
		outputs: [
			{
				internalType: "uint256[]",
				name: "",
				type: "uint256[]"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "withdrawAll",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	}
];
var bytecode = "0x6080604052600d805460ff191660011790553480156200001e57600080fd5b506040518060400160405280600781526020016642796f6120563160c81b8152506040518060400160405280600781526020016642594f415f563160c81b81525081600090805190602001906200007792919062000159565b5080516200008d90600190602084019062000159565b506200009f91506000905033620000a5565b6200023c565b620000b18282620000b5565b5050565b6000828152600a602090815260408083206001600160a01b038516845290915290205460ff16620000b1576000828152600a602090815260408083206001600160a01b03851684529091529020805460ff19166001179055620001153390565b6001600160a01b0316816001600160a01b0316837f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45050565b8280546200016790620001ff565b90600052602060002090601f0160209004810192826200018b5760008555620001d6565b82601f10620001a657805160ff1916838001178555620001d6565b82800160010185558215620001d6579182015b82811115620001d6578251825591602001919060010190620001b9565b50620001e4929150620001e8565b5090565b5b80821115620001e45760008155600101620001e9565b600181811c908216806200021457607f821691505b602082108114156200023657634e487b7160e01b600052602260045260246000fd5b50919050565b613fb7806200024c6000396000f3fe6080604052600436106102855760003560e01c8063623450cc11610153578063a11c30be116100cb578063c87b56dd1161007f578063d547741f11610064578063d547741f14610766578063e985e9c514610786578063f26b2bc0146107cf57600080fd5b8063c87b56dd14610726578063d14243b21461074657600080fd5b8063a22cb465116100b0578063a22cb465146106c6578063b88d4fde146106e6578063bed34bba1461070657600080fd5b8063a11c30be14610691578063a217fddf146106b157600080fd5b80639103a0e01161012257806391d148541161010757806391d148541461062357806395d89b4114610669578063a0712d681461067e57600080fd5b80639103a0e0146105c25780639118f31a146105f657600080fd5b8063623450cc1461054d5780636352211e1461057a57806370a082311461059a578063853828b6146105ba57600080fd5b80632f745c5911610201578063458f9cfb116101b55780634b42a0f81161019a5780634b42a0f8146104dd5780634f6ccce7146104fd57806352a7a9131461051d57600080fd5b8063458f9cfb1461048c578063471c1ea9146104bd57600080fd5b806336568abe116101e657806336568abe1461042c57806342842e0e1461044c578063438b63001461046c57600080fd5b80632f745c59146103ea57806333f717fe1461040a57600080fd5b806318160ddd1161025857806323b872dd1161023d57806323b872dd1461037a578063248a9ca31461039a5780632f2ff15d146103ca57600080fd5b806318160ddd1461033b5780631c3be41e1461035a57600080fd5b806301ffc9a71461028a57806306fdde03146102bf578063081812fc146102e1578063095ea7b314610319575b600080fd5b34801561029657600080fd5b506102aa6102a5366004613902565b6107ef565b60405190151581526020015b60405180910390f35b3480156102cb57600080fd5b506102d4610800565b6040516102b69190613d87565b3480156102ed57600080fd5b506103016102fc3660046138c6565b610892565b6040516001600160a01b0390911681526020016102b6565b34801561032557600080fd5b50610339610334366004613881565b61093d565b005b34801561034757600080fd5b506008545b6040519081526020016102b6565b34801561036657600080fd5b50610339610375366004613a86565b610a6f565b34801561038657600080fd5b5061033961039536600461379f565b610d02565b3480156103a657600080fd5b5061034c6103b53660046138c6565b6000908152600a602052604090206001015490565b3480156103d657600080fd5b506103396103e53660046138df565b610d89565b3480156103f657600080fd5b5061034c610405366004613881565b610daf565b34801561041657600080fd5b5061041f610e57565b6040516102b69190613d43565b34801561043857600080fd5b506103396104473660046138df565b610ef4565b34801561045857600080fd5b5061033961046736600461379f565b610f80565b34801561047857600080fd5b5061041f610487366004613751565b610f9b565b34801561049857600080fd5b506104ac6104a73660046138c6565b611054565b6040516102b6959493929190613d9a565b3480156104c957600080fd5b5061034c6104d8366004613af3565b6112e2565b3480156104e957600080fd5b5061034c6104f83660046139a0565b61173c565b34801561050957600080fd5b5061034c6105183660046138c6565b6118fe565b34801561052957600080fd5b506102aa6105383660046138c6565b6000908152600f602052604090205460ff1690565b34801561055957600080fd5b5061056d6105683660046138c6565b6119a2565b6040516102b69190613cc3565b34801561058657600080fd5b506103016105953660046138c6565b611b0f565b3480156105a657600080fd5b5061034c6105b5366004613751565b611b9a565b610339611c34565b3480156105ce57600080fd5b5061034c7f4504b9dfd7400a1522f49a8b4a100552da9236849581fd59b7363eb48c6a474c81565b34801561060257600080fd5b5061034c6106113660046138c6565b60009081526010602052604090205490565b34801561062f57600080fd5b506102aa61063e3660046138df565b6000918252600a602090815260408084206001600160a01b0393909316845291905290205460ff1690565b34801561067557600080fd5b506102d4611cd8565b61033961068c3660046138c6565b611ce7565b34801561069d57600080fd5b506103396106ac366004613a26565b611e3e565b3480156106bd57600080fd5b5061034c600081565b3480156106d257600080fd5b506103396106e1366004613857565b611f02565b3480156106f257600080fd5b506103396107013660046137db565b611fc7565b34801561071257600080fd5b506102aa61072136600461393c565b612055565b34801561073257600080fd5b506102d46107413660046138c6565b6120ae565b34801561075257600080fd5b506103396107613660046138ab565b6120b9565b34801561077257600080fd5b506103396107813660046138df565b612170565b34801561079257600080fd5b506102aa6107a136600461376c565b6001600160a01b03918216600090815260056020908152604080832093909416825291909152205460ff1690565b3480156107db57600080fd5b506102d46107ea366004613a49565b612196565b60006107fa826122df565b92915050565b60606000805461080f90613e96565b80601f016020809104026020016040519081016040528092919081815260200182805461083b90613e96565b80156108885780601f1061085d57610100808354040283529160200191610888565b820191906000526020600020905b81548152906001019060200180831161086b57829003601f168201915b5050505050905090565b6000818152600260205260408120546001600160a01b03166109215760405162461bcd60e51b815260206004820152602c60248201527f4552433732313a20617070726f76656420717565727920666f72206e6f6e657860448201527f697374656e7420746f6b656e000000000000000000000000000000000000000060648201526084015b60405180910390fd5b506000908152600460205260409020546001600160a01b031690565b600061094882611b0f565b9050806001600160a01b0316836001600160a01b031614156109d25760405162461bcd60e51b815260206004820152602160248201527f4552433732313a20617070726f76616c20746f2063757272656e74206f776e6560448201527f72000000000000000000000000000000000000000000000000000000000000006064820152608401610918565b336001600160a01b03821614806109ee57506109ee81336107a1565b610a605760405162461bcd60e51b815260206004820152603860248201527f4552433732313a20617070726f76652063616c6c6572206973206e6f74206f7760448201527f6e6572206e6f7220617070726f76656420666f7220616c6c00000000000000006064820152608401610918565b610a6a838361231d565b505050565b6000838152600260205260409020546001600160a01b0316610ad35760405162461bcd60e51b815260206004820152601360248201527f546f6b656e204944206d757374206578697374000000000000000000000000006044820152606401610918565b33610add84611b0f565b6001600160a01b031614610b595760405162461bcd60e51b815260206004820152602f60248201527f546865206f776e6572206d75737420626520746865206f6e6520617474656d7060448201527f74696e67207468652075706461746500000000000000000000000000000000006064820152608401610918565b806011600085815260200190815260200160002083604051610b7b9190613bbb565b90815260200160405180910390209080519060200190610b9c9291906135f6565b50600083815260126020908152604080832080548251818502810185019093528083529192909190849084015b82821015610c75578382906000526020600020018054610be890613e96565b80601f0160208091040260200160405190810160405280929190818152602001828054610c1490613e96565b8015610c615780601f10610c3657610100808354040283529160200191610c61565b820191906000526020600020905b815481529060010190602001808311610c4457829003601f168201915b505050505081526020019060010190610bc9565b50505050905060005b8151811015610cc857610caa828281518110610c9c57610c9c613f3c565b602002602001015185612055565b15610cb6575050505050565b80610cc081613ecb565b915050610c7e565b50600084815260126020908152604082208054600181018255908352918190208551610cfb9391909101918601906135f6565b5050505050565b610d0c3382612398565b610d7e5760405162461bcd60e51b815260206004820152603160248201527f4552433732313a207472616e736665722063616c6c6572206973206e6f74206f60448201527f776e6572206e6f7220617070726f7665640000000000000000000000000000006064820152608401610918565b610a6a83838361249c565b6000828152600a6020526040902060010154610da58133612681565b610a6a8383612701565b6000610dba83611b9a565b8210610e2e5760405162461bcd60e51b815260206004820152602b60248201527f455243373231456e756d657261626c653a206f776e657220696e646578206f7560448201527f74206f6620626f756e64730000000000000000000000000000000000000000006064820152608401610918565b506001600160a01b03919091166000908152600660209081526040808320938352929052205490565b60606000610e64600c5490565b67ffffffffffffffff811115610e7c57610e7c613f52565b604051908082528060200260200182016040528015610ea5578160200160208202803683370190505b50905060015b600c548111610eee578082610ec1600183613e3c565b81518110610ed157610ed1613f3c565b602090810291909101015280610ee681613ecb565b915050610eab565b50919050565b6001600160a01b0381163314610f725760405162461bcd60e51b815260206004820152602f60248201527f416363657373436f6e74726f6c3a2063616e206f6e6c792072656e6f756e636560448201527f20726f6c657320666f722073656c6600000000000000000000000000000000006064820152608401610918565b610f7c82826127a3565b5050565b610a6a83838360405180602001604052806000815250611fc7565b60606000610fa883611b9a565b905080610fc95760408051600080825260208201909252905b509392505050565b60008167ffffffffffffffff811115610fe457610fe4613f52565b60405190808252806020026020018201604052801561100d578160200160208202803683370190505b50905060005b82811015610fc1576110258582610daf565b82828151811061103757611037613f3c565b60209081029190910101528061104c81613ecb565b915050611013565b6000818152600e6020526040812054606091829182919081906110b95760405162461bcd60e51b815260206004820152601160248201527f417070204944206d7573742065786973740000000000000000000000000000006044820152606401610918565b6000600e60008881526020019081526020016000206040518060c0016040529081600082015481526020016001820180546110f390613e96565b80601f016020809104026020016040519081016040528092919081815260200182805461111f90613e96565b801561116c5780601f106111415761010080835404028352916020019161116c565b820191906000526020600020905b81548152906001019060200180831161114f57829003601f168201915b5050505050815260200160028201805461118590613e96565b80601f01602080910402602001604051908101604052809291908181526020018280546111b190613e96565b80156111fe5780601f106111d3576101008083540402835291602001916111fe565b820191906000526020600020905b8154815290600101906020018083116111e157829003601f168201915b505050505081526020016003820154815260200160048201805461122190613e96565b80601f016020809104026020016040519081016040528092919081815260200182805461124d90613e96565b801561129a5780601f1061126f5761010080835404028352916020019161129a565b820191906000526020600020905b81548152906001019060200180831161127d57829003601f168201915b5050509183525050600591909101546001600160a01b03166020918201528101516040820151608083015160a0840151606090940151929b919a509850919650945092505050565b3360009081527ff4b9b84b479333f393257dee6f7e470de6578c01080171602fbce8f42090e1f8602052604081205460ff166113855760405162461bcd60e51b8152602060048201526024808201527f4d757374206265206120646576656c6f70657220746f2063726561746520616e60448201527f20617070000000000000000000000000000000000000000000000000000000006064820152608401610918565b6000868152600e60205260409020546113e05760405162461bcd60e51b815260206004820152601160248201527f417070204944206d7573742065786973740000000000000000000000000000006044820152606401610918565b6000600e60008881526020019081526020016000206040518060c00160405290816000820154815260200160018201805461141a90613e96565b80601f016020809104026020016040519081016040528092919081815260200182805461144690613e96565b80156114935780601f1061146857610100808354040283529160200191611493565b820191906000526020600020905b81548152906001019060200180831161147657829003601f168201915b505050505081526020016002820180546114ac90613e96565b80601f01602080910402602001604051908101604052809291908181526020018280546114d890613e96565b80156115255780601f106114fa57610100808354040283529160200191611525565b820191906000526020600020905b81548152906001019060200180831161150857829003601f168201915b505050505081526020016003820154815260200160048201805461154890613e96565b80601f016020809104026020016040519081016040528092919081815260200182805461157490613e96565b80156115c15780601f10611596576101008083540402835291602001916115c1565b820191906000526020600020905b8154815290600101906020018083116115a457829003601f168201915b5050509183525050600591909101546001600160a01b0390811660209092019190915260a08201519192501633146116615760405162461bcd60e51b815260206004820152602160248201527f596f75206d75737420626520746865206f776e6572206f66207468697320617060448201527f70000000000000000000000000000000000000000000000000000000000000006064820152608401610918565b6040805160c081018252888152602080820189815282840189905260608301889052608083018790523360a084015260008b8152600e83529390932082518155925180519293926116b892600185019201906135f6565b50604082015180516116d49160028401916020909101906135f6565b5060608201516003820155608082015180516116fa9160048401916020909101906135f6565b5060a091909101516005909101805473ffffffffffffffffffffffffffffffffffffffff19166001600160a01b03909216919091179055509495945050505050565b3360009081527ff4b9b84b479333f393257dee6f7e470de6578c01080171602fbce8f42090e1f8602052604081205460ff168061177c5750600d5460ff16155b6117ed5760405162461bcd60e51b8152602060048201526024808201527f4d757374206265206120646576656c6f70657220746f2063726561746520616e60448201527f20617070000000000000000000000000000000000000000000000000000000006064820152608401610918565b6117fb600c80546001019055565b6000611806600c5490565b6000818152600f60209081526040808320805460ff19166001908117909155815160c0810183528581528084018c81528184018c9052606082018b9052608082018a90523360a0830152868652600e85529290942084518155915180519596509394919361187a93918501929101906135f6565b50604082015180516118969160028401916020909101906135f6565b5060608201516003820155608082015180516118bc9160048401916020909101906135f6565b5060a091909101516005909101805473ffffffffffffffffffffffffffffffffffffffff19166001600160a01b0390921691909117905590505b949350505050565b600061190960085490565b821061197d5760405162461bcd60e51b815260206004820152602c60248201527f455243373231456e756d657261626c653a20676c6f62616c20696e646578206f60448201527f7574206f6620626f756e647300000000000000000000000000000000000000006064820152608401610918565b6008828154811061199057611990613f3c565b90600052602060002001549050919050565b6000818152600260205260409020546060906001600160a01b0316611a2f5760405162461bcd60e51b815260206004820152602660248201527f546f6b656e204944206d75737420657869737420746f2067657420707265666560448201527f72656e63657300000000000000000000000000000000000000000000000000006064820152608401610918565b600082815260126020908152604080832080548251818502810185019093528083529193909284015b82821015611b04578382906000526020600020018054611a7790613e96565b80601f0160208091040260200160405190810160405280929190818152602001828054611aa390613e96565b8015611af05780601f10611ac557610100808354040283529160200191611af0565b820191906000526020600020905b815481529060010190602001808311611ad357829003601f168201915b505050505081526020019060010190611a58565b505050509050919050565b6000818152600260205260408120546001600160a01b0316806107fa5760405162461bcd60e51b815260206004820152602960248201527f4552433732313a206f776e657220717565727920666f72206e6f6e657869737460448201527f656e7420746f6b656e00000000000000000000000000000000000000000000006064820152608401610918565b60006001600160a01b038216611c185760405162461bcd60e51b815260206004820152602a60248201527f4552433732313a2062616c616e636520717565727920666f7220746865207a6560448201527f726f2061646472657373000000000000000000000000000000000000000000006064820152608401610918565b506001600160a01b031660009081526003602052604090205490565b3360009081527f13da86008ba1c6922daee3e07db95305ef49ebced9f5467a0b8613fcc6b343e3602052604090205460ff16611cb25760405162461bcd60e51b815260206004820152601c60248201527f4d75737420626520616e2061646d696e20746f207769746864726177000000006044820152606401610918565b60405133904780156108fc02916000818181858888f19350505050611cd657600080fd5b565b60606001805461080f90613e96565b6000818152600e6020526040902054611d425760405162461bcd60e51b815260206004820152601160248201527f417070204944206d7573742065786973740000000000000000000000000000006044820152606401610918565b6000611d4d60085490565b90506000611d5c826001613df1565b9050611d683382612826565b6000818152600260205260409020546001600160a01b0316611d8957600080fd5b6000818152601060209081526040808320869055858352600e90915290206004018054610a6a918391611dbb90613e96565b80601f0160208091040260200160405190810160405280929190818152602001828054611de790613e96565b8015611e345780601f10611e0957610100808354040283529160200191611e34565b820191906000526020600020905b815481529060010190602001808311611e1757829003601f168201915b5050505050612840565b3360009081527f13da86008ba1c6922daee3e07db95305ef49ebced9f5467a0b8613fcc6b343e3602052604090205460ff16611ee25760405162461bcd60e51b815260206004820152602860248201527f4d75737420626520616e2061646d696e20746f206368616e676520616e79206160448201527f7070726f76616c730000000000000000000000000000000000000000000000006064820152608401610918565b6000918252600f6020526040909120805460ff1916911515919091179055565b6001600160a01b038216331415611f5b5760405162461bcd60e51b815260206004820152601960248201527f4552433732313a20617070726f766520746f2063616c6c6572000000000000006044820152606401610918565b3360008181526005602090815260408083206001600160a01b03871680855290835292819020805460ff191686151590811790915590519081529192917f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31910160405180910390a35050565b611fd13383612398565b6120435760405162461bcd60e51b815260206004820152603160248201527f4552433732313a207472616e736665722063616c6c6572206973206e6f74206f60448201527f776e6572206e6f7220617070726f7665640000000000000000000000000000006064820152608401610918565b61204f848484846128e9565b50505050565b6000816040516020016120689190613bbb565b604051602081830303815290604052805190602001208360405160200161208f9190613bbb565b6040516020818303038152906040528051906020012014905092915050565b60606107fa82612972565b3360009081527f13da86008ba1c6922daee3e07db95305ef49ebced9f5467a0b8613fcc6b343e3602052604090205460ff1661215d5760405162461bcd60e51b815260206004820152602c60248201527f4d75737420626520616e2061646d696e20746f2073657420646576656c6f706560448201527f72206f6e626f617264696e6700000000000000000000000000000000000000006064820152608401610918565b600d805460ff1916911515919091179055565b6000828152600a602052604090206001015461218c8133612681565b610a6a83836127a3565b6000828152600260205260409020546060906001600160a01b03166122235760405162461bcd60e51b815260206004820152602660248201527f546f6b656e204944206d75737420657869737420746f2067657420707265666560448201527f72656e63657300000000000000000000000000000000000000000000000000006064820152608401610918565b600083815260116020526040908190209051612240908490613bbb565b9081526020016040518091039020805461225990613e96565b80601f016020809104026020016040519081016040528092919081815260200182805461228590613e96565b80156122d25780601f106122a7576101008083540402835291602001916122d2565b820191906000526020600020905b8154815290600101906020018083116122b557829003601f168201915b5050505050905092915050565b60006001600160e01b031982167f7965db0b0000000000000000000000000000000000000000000000000000000014806107fa57506107fa82612afd565b6000818152600460205260409020805473ffffffffffffffffffffffffffffffffffffffff19166001600160a01b038416908117909155819061235f82611b0f565b6001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45050565b6000818152600260205260408120546001600160a01b03166124225760405162461bcd60e51b815260206004820152602c60248201527f4552433732313a206f70657261746f7220717565727920666f72206e6f6e657860448201527f697374656e7420746f6b656e00000000000000000000000000000000000000006064820152608401610918565b600061242d83611b0f565b9050806001600160a01b0316846001600160a01b031614806124685750836001600160a01b031661245d84610892565b6001600160a01b0316145b806118f657506001600160a01b0380821660009081526005602090815260408083209388168352929052205460ff166118f6565b826001600160a01b03166124af82611b0f565b6001600160a01b03161461252b5760405162461bcd60e51b815260206004820152602960248201527f4552433732313a207472616e73666572206f6620746f6b656e2074686174206960448201527f73206e6f74206f776e00000000000000000000000000000000000000000000006064820152608401610918565b6001600160a01b0382166125a65760405162461bcd60e51b8152602060048201526024808201527f4552433732313a207472616e7366657220746f20746865207a65726f2061646460448201527f72657373000000000000000000000000000000000000000000000000000000006064820152608401610918565b6125b1838383612b3b565b6125bc60008261231d565b6001600160a01b03831660009081526003602052604081208054600192906125e5908490613e3c565b90915550506001600160a01b0382166000908152600360205260408120805460019290612613908490613df1565b9091555050600081815260026020526040808220805473ffffffffffffffffffffffffffffffffffffffff19166001600160a01b0386811691821790925591518493918716917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef91a4505050565b6000828152600a602090815260408083206001600160a01b038516845290915290205460ff16610f7c576126bf816001600160a01b03166014612b46565b6126ca836020612b46565b6040516020016126db929190613c06565b60408051601f198184030181529082905262461bcd60e51b825261091891600401613d87565b6000828152600a602090815260408083206001600160a01b038516845290915290205460ff16610f7c576000828152600a602090815260408083206001600160a01b03851684529091529020805460ff1916600117905561275f3390565b6001600160a01b0316816001600160a01b0316837f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45050565b6000828152600a602090815260408083206001600160a01b038516845290915290205460ff1615610f7c576000828152600a602090815260408083206001600160a01b0385168085529252808320805460ff1916905551339285917ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b9190a45050565b610f7c828260405180602001604052806000815250612d76565b6000828152600260205260409020546001600160a01b03166128ca5760405162461bcd60e51b815260206004820152602e60248201527f45524337323155524953746f726167653a2055524920736574206f66206e6f6e60448201527f6578697374656e7420746f6b656e0000000000000000000000000000000000006064820152608401610918565b6000828152600b602090815260409091208251610a6a928401906135f6565b6128f484848461249c565b61290084848484612dff565b61204f5760405162461bcd60e51b815260206004820152603260248201527f4552433732313a207472616e7366657220746f206e6f6e20455243373231526560448201527f63656976657220696d706c656d656e74657200000000000000000000000000006064820152608401610918565b6000818152600260205260409020546060906001600160a01b03166129ff5760405162461bcd60e51b815260206004820152603160248201527f45524337323155524953746f726167653a2055524920717565727920666f722060448201527f6e6f6e6578697374656e7420746f6b656e0000000000000000000000000000006064820152608401610918565b6000828152600b602052604081208054612a1890613e96565b80601f0160208091040260200160405190810160405280929190818152602001828054612a4490613e96565b8015612a915780601f10612a6657610100808354040283529160200191612a91565b820191906000526020600020905b815481529060010190602001808311612a7457829003601f168201915b505050505090506000612aaf60408051602081019091526000815290565b9050805160001415612ac2575092915050565b815115612af4578082604051602001612adc929190613bd7565b60405160208183030381529060405292505050919050565b6118f684612f91565b60006001600160e01b031982167f780e9d630000000000000000000000000000000000000000000000000000000014806107fa57506107fa82613086565b610a6a838383613121565b60606000612b55836002613e1d565b612b60906002613df1565b67ffffffffffffffff811115612b7857612b78613f52565b6040519080825280601f01601f191660200182016040528015612ba2576020820181803683370190505b5090507f300000000000000000000000000000000000000000000000000000000000000081600081518110612bd957612bd9613f3c565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a9053507f780000000000000000000000000000000000000000000000000000000000000081600181518110612c3c57612c3c613f3c565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a9053506000612c78846002613e1d565b612c83906001613df1565b90505b6001811115612d20577f303132333435363738396162636465660000000000000000000000000000000085600f1660108110612cc457612cc4613f3c565b1a60f81b828281518110612cda57612cda613f3c565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a90535060049490941c93612d1981613e7f565b9050612c86565b508315612d6f5760405162461bcd60e51b815260206004820181905260248201527f537472696e67733a20686578206c656e67746820696e73756666696369656e746044820152606401610918565b9392505050565b612d8083836131d9565b612d8d6000848484612dff565b610a6a5760405162461bcd60e51b815260206004820152603260248201527f4552433732313a207472616e7366657220746f206e6f6e20455243373231526560448201527f63656976657220696d706c656d656e74657200000000000000000000000000006064820152608401610918565b60006001600160a01b0384163b15612f89576040517f150b7a020000000000000000000000000000000000000000000000000000000081526001600160a01b0385169063150b7a0290612e5c903390899088908890600401613c87565b602060405180830381600087803b158015612e7657600080fd5b505af1925050508015612ea6575060408051601f3d908101601f19168201909252612ea39181019061391f565b60015b612f56573d808015612ed4576040519150601f19603f3d011682016040523d82523d6000602084013e612ed9565b606091505b508051612f4e5760405162461bcd60e51b815260206004820152603260248201527f4552433732313a207472616e7366657220746f206e6f6e20455243373231526560448201527f63656976657220696d706c656d656e74657200000000000000000000000000006064820152608401610918565b805181602001fd5b6001600160e01b0319167f150b7a02000000000000000000000000000000000000000000000000000000001490506118f6565b5060016118f6565b6000818152600260205260409020546060906001600160a01b031661301e5760405162461bcd60e51b815260206004820152602f60248201527f4552433732314d657461646174613a2055524920717565727920666f72206e6f60448201527f6e6578697374656e7420746f6b656e00000000000000000000000000000000006064820152608401610918565b600061303560408051602081019091526000815290565b905060008151116130555760405180602001604052806000815250612d6f565b8061305f84613334565b604051602001613070929190613bd7565b6040516020818303038152906040529392505050565b60006001600160e01b031982167f80ac58cd0000000000000000000000000000000000000000000000000000000014806130e957506001600160e01b031982167f5b5e139f00000000000000000000000000000000000000000000000000000000145b806107fa57507f01ffc9a7000000000000000000000000000000000000000000000000000000006001600160e01b03198316146107fa565b6001600160a01b03831661317c5761317781600880546000838152600960205260408120829055600182018355919091527ff3f7a9fe364faab93b216da50a3214154f22a0a2b415b23a84c8169e8b636ee30155565b61319f565b816001600160a01b0316836001600160a01b03161461319f5761319f8382613466565b6001600160a01b0382166131b657610a6a81613503565b826001600160a01b0316826001600160a01b031614610a6a57610a6a82826135b2565b6001600160a01b03821661322f5760405162461bcd60e51b815260206004820181905260248201527f4552433732313a206d696e7420746f20746865207a65726f20616464726573736044820152606401610918565b6000818152600260205260409020546001600160a01b0316156132945760405162461bcd60e51b815260206004820152601c60248201527f4552433732313a20746f6b656e20616c7265616479206d696e746564000000006044820152606401610918565b6132a060008383612b3b565b6001600160a01b03821660009081526003602052604081208054600192906132c9908490613df1565b9091555050600081815260026020526040808220805473ffffffffffffffffffffffffffffffffffffffff19166001600160a01b03861690811790915590518392907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef908290a45050565b60608161337457505060408051808201909152600181527f3000000000000000000000000000000000000000000000000000000000000000602082015290565b8160005b811561339e578061338881613ecb565b91506133979050600a83613e09565b9150613378565b60008167ffffffffffffffff8111156133b9576133b9613f52565b6040519080825280601f01601f1916602001820160405280156133e3576020820181803683370190505b5090505b84156118f6576133f8600183613e3c565b9150613405600a86613ee6565b613410906030613df1565b60f81b81838151811061342557613425613f3c565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a90535061345f600a86613e09565b94506133e7565b6000600161347384611b9a565b61347d9190613e3c565b6000838152600760205260409020549091508082146134d0576001600160a01b03841660009081526006602090815260408083208584528252808320548484528184208190558352600790915290208190555b5060009182526007602090815260408084208490556001600160a01b039094168352600681528383209183525290812055565b60085460009061351590600190613e3c565b6000838152600960205260408120546008805493945090928490811061353d5761353d613f3c565b90600052602060002001549050806008838154811061355e5761355e613f3c565b600091825260208083209091019290925582815260099091526040808220849055858252812055600880548061359657613596613f26565b6001900381819060005260206000200160009055905550505050565b60006135bd83611b9a565b6001600160a01b039093166000908152600660209081526040808320868452825280832085905593825260079052919091209190915550565b82805461360290613e96565b90600052602060002090601f016020900481019282613624576000855561366a565b82601f1061363d57805160ff191683800117855561366a565b8280016001018555821561366a579182015b8281111561366a57825182559160200191906001019061364f565b5061367692915061367a565b5090565b5b80821115613676576000815560010161367b565b600067ffffffffffffffff808411156136aa576136aa613f52565b604051601f8501601f19908116603f011681019082821181831017156136d2576136d2613f52565b816040528093508581528686860111156136eb57600080fd5b858560208301376000602087830101525050509392505050565b80356001600160a01b038116811461371c57600080fd5b919050565b8035801515811461371c57600080fd5b600082601f83011261374257600080fd5b612d6f8383356020850161368f565b60006020828403121561376357600080fd5b612d6f82613705565b6000806040838503121561377f57600080fd5b61378883613705565b915061379660208401613705565b90509250929050565b6000806000606084860312156137b457600080fd5b6137bd84613705565b92506137cb60208501613705565b9150604084013590509250925092565b600080600080608085870312156137f157600080fd5b6137fa85613705565b935061380860208601613705565b925060408501359150606085013567ffffffffffffffff81111561382b57600080fd5b8501601f8101871361383c57600080fd5b61384b8782356020840161368f565b91505092959194509250565b6000806040838503121561386a57600080fd5b61387383613705565b915061379660208401613721565b6000806040838503121561389457600080fd5b61389d83613705565b946020939093013593505050565b6000602082840312156138bd57600080fd5b612d6f82613721565b6000602082840312156138d857600080fd5b5035919050565b600080604083850312156138f257600080fd5b8235915061379660208401613705565b60006020828403121561391457600080fd5b8135612d6f81613f68565b60006020828403121561393157600080fd5b8151612d6f81613f68565b6000806040838503121561394f57600080fd5b823567ffffffffffffffff8082111561396757600080fd5b61397386838701613731565b9350602085013591508082111561398957600080fd5b5061399685828601613731565b9150509250929050565b600080600080608085870312156139b657600080fd5b843567ffffffffffffffff808211156139ce57600080fd5b6139da88838901613731565b955060208701359150808211156139f057600080fd5b6139fc88838901613731565b9450604087013593506060870135915080821115613a1957600080fd5b5061384b87828801613731565b60008060408385031215613a3957600080fd5b8235915061379660208401613721565b60008060408385031215613a5c57600080fd5b82359150602083013567ffffffffffffffff811115613a7a57600080fd5b61399685828601613731565b600080600060608486031215613a9b57600080fd5b83359250602084013567ffffffffffffffff80821115613aba57600080fd5b613ac687838801613731565b93506040860135915080821115613adc57600080fd5b50613ae986828701613731565b9150509250925092565b600080600080600060a08688031215613b0b57600080fd5b85359450602086013567ffffffffffffffff80821115613b2a57600080fd5b613b3689838a01613731565b95506040880135915080821115613b4c57600080fd5b613b5889838a01613731565b9450606088013593506080880135915080821115613b7557600080fd5b50613b8288828901613731565b9150509295509295909350565b60008151808452613ba7816020860160208601613e53565b601f01601f19169290920160200192915050565b60008251613bcd818460208701613e53565b9190910192915050565b60008351613be9818460208801613e53565b835190830190613bfd818360208801613e53565b01949350505050565b7f416363657373436f6e74726f6c3a206163636f756e7420000000000000000000815260008351613c3e816017850160208801613e53565b7f206973206d697373696e6720726f6c65200000000000000000000000000000006017918401918201528351613c7b816028840160208801613e53565b01602801949350505050565b60006001600160a01b03808716835280861660208401525083604083015260806060830152613cb96080830184613b8f565b9695505050505050565b6000602080830181845280855180835260408601915060408160051b870101925083870160005b82811015613d36577fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc0888603018452613d24858351613b8f565b94509285019290850190600101613cea565b5092979650505050505050565b6020808252825182820181905260009190848201906040850190845b81811015613d7b57835183529284019291840191600101613d5f565b50909695505050505050565b602081526000612d6f6020830184613b8f565b60a081526000613dad60a0830188613b8f565b8281036020840152613dbf8188613b8f565b90508281036040840152613dd38187613b8f565b6001600160a01b039590951660608401525050608001529392505050565b60008219821115613e0457613e04613efa565b500190565b600082613e1857613e18613f10565b500490565b6000816000190483118215151615613e3757613e37613efa565b500290565b600082821015613e4e57613e4e613efa565b500390565b60005b83811015613e6e578181015183820152602001613e56565b8381111561204f5750506000910152565b600081613e8e57613e8e613efa565b506000190190565b600181811c90821680613eaa57607f821691505b60208210811415610eee57634e487b7160e01b600052602260045260246000fd5b6000600019821415613edf57613edf613efa565b5060010190565b600082613ef557613ef5613f10565b500690565b634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052601260045260246000fd5b634e487b7160e01b600052603160045260246000fd5b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052604160045260246000fd5b6001600160e01b031981168114613f7e57600080fd5b5056fea2646970667358221220bb03cda73fdeb4a2ff265bf1e27ac3e77aac8a7e8d2a2c5e193c6b624cb1d42064736f6c63430008060033";
var deployedBytecode = "0x6080604052600436106102855760003560e01c8063623450cc11610153578063a11c30be116100cb578063c87b56dd1161007f578063d547741f11610064578063d547741f14610766578063e985e9c514610786578063f26b2bc0146107cf57600080fd5b8063c87b56dd14610726578063d14243b21461074657600080fd5b8063a22cb465116100b0578063a22cb465146106c6578063b88d4fde146106e6578063bed34bba1461070657600080fd5b8063a11c30be14610691578063a217fddf146106b157600080fd5b80639103a0e01161012257806391d148541161010757806391d148541461062357806395d89b4114610669578063a0712d681461067e57600080fd5b80639103a0e0146105c25780639118f31a146105f657600080fd5b8063623450cc1461054d5780636352211e1461057a57806370a082311461059a578063853828b6146105ba57600080fd5b80632f745c5911610201578063458f9cfb116101b55780634b42a0f81161019a5780634b42a0f8146104dd5780634f6ccce7146104fd57806352a7a9131461051d57600080fd5b8063458f9cfb1461048c578063471c1ea9146104bd57600080fd5b806336568abe116101e657806336568abe1461042c57806342842e0e1461044c578063438b63001461046c57600080fd5b80632f745c59146103ea57806333f717fe1461040a57600080fd5b806318160ddd1161025857806323b872dd1161023d57806323b872dd1461037a578063248a9ca31461039a5780632f2ff15d146103ca57600080fd5b806318160ddd1461033b5780631c3be41e1461035a57600080fd5b806301ffc9a71461028a57806306fdde03146102bf578063081812fc146102e1578063095ea7b314610319575b600080fd5b34801561029657600080fd5b506102aa6102a5366004613902565b6107ef565b60405190151581526020015b60405180910390f35b3480156102cb57600080fd5b506102d4610800565b6040516102b69190613d87565b3480156102ed57600080fd5b506103016102fc3660046138c6565b610892565b6040516001600160a01b0390911681526020016102b6565b34801561032557600080fd5b50610339610334366004613881565b61093d565b005b34801561034757600080fd5b506008545b6040519081526020016102b6565b34801561036657600080fd5b50610339610375366004613a86565b610a6f565b34801561038657600080fd5b5061033961039536600461379f565b610d02565b3480156103a657600080fd5b5061034c6103b53660046138c6565b6000908152600a602052604090206001015490565b3480156103d657600080fd5b506103396103e53660046138df565b610d89565b3480156103f657600080fd5b5061034c610405366004613881565b610daf565b34801561041657600080fd5b5061041f610e57565b6040516102b69190613d43565b34801561043857600080fd5b506103396104473660046138df565b610ef4565b34801561045857600080fd5b5061033961046736600461379f565b610f80565b34801561047857600080fd5b5061041f610487366004613751565b610f9b565b34801561049857600080fd5b506104ac6104a73660046138c6565b611054565b6040516102b6959493929190613d9a565b3480156104c957600080fd5b5061034c6104d8366004613af3565b6112e2565b3480156104e957600080fd5b5061034c6104f83660046139a0565b61173c565b34801561050957600080fd5b5061034c6105183660046138c6565b6118fe565b34801561052957600080fd5b506102aa6105383660046138c6565b6000908152600f602052604090205460ff1690565b34801561055957600080fd5b5061056d6105683660046138c6565b6119a2565b6040516102b69190613cc3565b34801561058657600080fd5b506103016105953660046138c6565b611b0f565b3480156105a657600080fd5b5061034c6105b5366004613751565b611b9a565b610339611c34565b3480156105ce57600080fd5b5061034c7f4504b9dfd7400a1522f49a8b4a100552da9236849581fd59b7363eb48c6a474c81565b34801561060257600080fd5b5061034c6106113660046138c6565b60009081526010602052604090205490565b34801561062f57600080fd5b506102aa61063e3660046138df565b6000918252600a602090815260408084206001600160a01b0393909316845291905290205460ff1690565b34801561067557600080fd5b506102d4611cd8565b61033961068c3660046138c6565b611ce7565b34801561069d57600080fd5b506103396106ac366004613a26565b611e3e565b3480156106bd57600080fd5b5061034c600081565b3480156106d257600080fd5b506103396106e1366004613857565b611f02565b3480156106f257600080fd5b506103396107013660046137db565b611fc7565b34801561071257600080fd5b506102aa61072136600461393c565b612055565b34801561073257600080fd5b506102d46107413660046138c6565b6120ae565b34801561075257600080fd5b506103396107613660046138ab565b6120b9565b34801561077257600080fd5b506103396107813660046138df565b612170565b34801561079257600080fd5b506102aa6107a136600461376c565b6001600160a01b03918216600090815260056020908152604080832093909416825291909152205460ff1690565b3480156107db57600080fd5b506102d46107ea366004613a49565b612196565b60006107fa826122df565b92915050565b60606000805461080f90613e96565b80601f016020809104026020016040519081016040528092919081815260200182805461083b90613e96565b80156108885780601f1061085d57610100808354040283529160200191610888565b820191906000526020600020905b81548152906001019060200180831161086b57829003601f168201915b5050505050905090565b6000818152600260205260408120546001600160a01b03166109215760405162461bcd60e51b815260206004820152602c60248201527f4552433732313a20617070726f76656420717565727920666f72206e6f6e657860448201527f697374656e7420746f6b656e000000000000000000000000000000000000000060648201526084015b60405180910390fd5b506000908152600460205260409020546001600160a01b031690565b600061094882611b0f565b9050806001600160a01b0316836001600160a01b031614156109d25760405162461bcd60e51b815260206004820152602160248201527f4552433732313a20617070726f76616c20746f2063757272656e74206f776e6560448201527f72000000000000000000000000000000000000000000000000000000000000006064820152608401610918565b336001600160a01b03821614806109ee57506109ee81336107a1565b610a605760405162461bcd60e51b815260206004820152603860248201527f4552433732313a20617070726f76652063616c6c6572206973206e6f74206f7760448201527f6e6572206e6f7220617070726f76656420666f7220616c6c00000000000000006064820152608401610918565b610a6a838361231d565b505050565b6000838152600260205260409020546001600160a01b0316610ad35760405162461bcd60e51b815260206004820152601360248201527f546f6b656e204944206d757374206578697374000000000000000000000000006044820152606401610918565b33610add84611b0f565b6001600160a01b031614610b595760405162461bcd60e51b815260206004820152602f60248201527f546865206f776e6572206d75737420626520746865206f6e6520617474656d7060448201527f74696e67207468652075706461746500000000000000000000000000000000006064820152608401610918565b806011600085815260200190815260200160002083604051610b7b9190613bbb565b90815260200160405180910390209080519060200190610b9c9291906135f6565b50600083815260126020908152604080832080548251818502810185019093528083529192909190849084015b82821015610c75578382906000526020600020018054610be890613e96565b80601f0160208091040260200160405190810160405280929190818152602001828054610c1490613e96565b8015610c615780601f10610c3657610100808354040283529160200191610c61565b820191906000526020600020905b815481529060010190602001808311610c4457829003601f168201915b505050505081526020019060010190610bc9565b50505050905060005b8151811015610cc857610caa828281518110610c9c57610c9c613f3c565b602002602001015185612055565b15610cb6575050505050565b80610cc081613ecb565b915050610c7e565b50600084815260126020908152604082208054600181018255908352918190208551610cfb9391909101918601906135f6565b5050505050565b610d0c3382612398565b610d7e5760405162461bcd60e51b815260206004820152603160248201527f4552433732313a207472616e736665722063616c6c6572206973206e6f74206f60448201527f776e6572206e6f7220617070726f7665640000000000000000000000000000006064820152608401610918565b610a6a83838361249c565b6000828152600a6020526040902060010154610da58133612681565b610a6a8383612701565b6000610dba83611b9a565b8210610e2e5760405162461bcd60e51b815260206004820152602b60248201527f455243373231456e756d657261626c653a206f776e657220696e646578206f7560448201527f74206f6620626f756e64730000000000000000000000000000000000000000006064820152608401610918565b506001600160a01b03919091166000908152600660209081526040808320938352929052205490565b60606000610e64600c5490565b67ffffffffffffffff811115610e7c57610e7c613f52565b604051908082528060200260200182016040528015610ea5578160200160208202803683370190505b50905060015b600c548111610eee578082610ec1600183613e3c565b81518110610ed157610ed1613f3c565b602090810291909101015280610ee681613ecb565b915050610eab565b50919050565b6001600160a01b0381163314610f725760405162461bcd60e51b815260206004820152602f60248201527f416363657373436f6e74726f6c3a2063616e206f6e6c792072656e6f756e636560448201527f20726f6c657320666f722073656c6600000000000000000000000000000000006064820152608401610918565b610f7c82826127a3565b5050565b610a6a83838360405180602001604052806000815250611fc7565b60606000610fa883611b9a565b905080610fc95760408051600080825260208201909252905b509392505050565b60008167ffffffffffffffff811115610fe457610fe4613f52565b60405190808252806020026020018201604052801561100d578160200160208202803683370190505b50905060005b82811015610fc1576110258582610daf565b82828151811061103757611037613f3c565b60209081029190910101528061104c81613ecb565b915050611013565b6000818152600e6020526040812054606091829182919081906110b95760405162461bcd60e51b815260206004820152601160248201527f417070204944206d7573742065786973740000000000000000000000000000006044820152606401610918565b6000600e60008881526020019081526020016000206040518060c0016040529081600082015481526020016001820180546110f390613e96565b80601f016020809104026020016040519081016040528092919081815260200182805461111f90613e96565b801561116c5780601f106111415761010080835404028352916020019161116c565b820191906000526020600020905b81548152906001019060200180831161114f57829003601f168201915b5050505050815260200160028201805461118590613e96565b80601f01602080910402602001604051908101604052809291908181526020018280546111b190613e96565b80156111fe5780601f106111d3576101008083540402835291602001916111fe565b820191906000526020600020905b8154815290600101906020018083116111e157829003601f168201915b505050505081526020016003820154815260200160048201805461122190613e96565b80601f016020809104026020016040519081016040528092919081815260200182805461124d90613e96565b801561129a5780601f1061126f5761010080835404028352916020019161129a565b820191906000526020600020905b81548152906001019060200180831161127d57829003601f168201915b5050509183525050600591909101546001600160a01b03166020918201528101516040820151608083015160a0840151606090940151929b919a509850919650945092505050565b3360009081527ff4b9b84b479333f393257dee6f7e470de6578c01080171602fbce8f42090e1f8602052604081205460ff166113855760405162461bcd60e51b8152602060048201526024808201527f4d757374206265206120646576656c6f70657220746f2063726561746520616e60448201527f20617070000000000000000000000000000000000000000000000000000000006064820152608401610918565b6000868152600e60205260409020546113e05760405162461bcd60e51b815260206004820152601160248201527f417070204944206d7573742065786973740000000000000000000000000000006044820152606401610918565b6000600e60008881526020019081526020016000206040518060c00160405290816000820154815260200160018201805461141a90613e96565b80601f016020809104026020016040519081016040528092919081815260200182805461144690613e96565b80156114935780601f1061146857610100808354040283529160200191611493565b820191906000526020600020905b81548152906001019060200180831161147657829003601f168201915b505050505081526020016002820180546114ac90613e96565b80601f01602080910402602001604051908101604052809291908181526020018280546114d890613e96565b80156115255780601f106114fa57610100808354040283529160200191611525565b820191906000526020600020905b81548152906001019060200180831161150857829003601f168201915b505050505081526020016003820154815260200160048201805461154890613e96565b80601f016020809104026020016040519081016040528092919081815260200182805461157490613e96565b80156115c15780601f10611596576101008083540402835291602001916115c1565b820191906000526020600020905b8154815290600101906020018083116115a457829003601f168201915b5050509183525050600591909101546001600160a01b0390811660209092019190915260a08201519192501633146116615760405162461bcd60e51b815260206004820152602160248201527f596f75206d75737420626520746865206f776e6572206f66207468697320617060448201527f70000000000000000000000000000000000000000000000000000000000000006064820152608401610918565b6040805160c081018252888152602080820189815282840189905260608301889052608083018790523360a084015260008b8152600e83529390932082518155925180519293926116b892600185019201906135f6565b50604082015180516116d49160028401916020909101906135f6565b5060608201516003820155608082015180516116fa9160048401916020909101906135f6565b5060a091909101516005909101805473ffffffffffffffffffffffffffffffffffffffff19166001600160a01b03909216919091179055509495945050505050565b3360009081527ff4b9b84b479333f393257dee6f7e470de6578c01080171602fbce8f42090e1f8602052604081205460ff168061177c5750600d5460ff16155b6117ed5760405162461bcd60e51b8152602060048201526024808201527f4d757374206265206120646576656c6f70657220746f2063726561746520616e60448201527f20617070000000000000000000000000000000000000000000000000000000006064820152608401610918565b6117fb600c80546001019055565b6000611806600c5490565b6000818152600f60209081526040808320805460ff19166001908117909155815160c0810183528581528084018c81528184018c9052606082018b9052608082018a90523360a0830152868652600e85529290942084518155915180519596509394919361187a93918501929101906135f6565b50604082015180516118969160028401916020909101906135f6565b5060608201516003820155608082015180516118bc9160048401916020909101906135f6565b5060a091909101516005909101805473ffffffffffffffffffffffffffffffffffffffff19166001600160a01b0390921691909117905590505b949350505050565b600061190960085490565b821061197d5760405162461bcd60e51b815260206004820152602c60248201527f455243373231456e756d657261626c653a20676c6f62616c20696e646578206f60448201527f7574206f6620626f756e647300000000000000000000000000000000000000006064820152608401610918565b6008828154811061199057611990613f3c565b90600052602060002001549050919050565b6000818152600260205260409020546060906001600160a01b0316611a2f5760405162461bcd60e51b815260206004820152602660248201527f546f6b656e204944206d75737420657869737420746f2067657420707265666560448201527f72656e63657300000000000000000000000000000000000000000000000000006064820152608401610918565b600082815260126020908152604080832080548251818502810185019093528083529193909284015b82821015611b04578382906000526020600020018054611a7790613e96565b80601f0160208091040260200160405190810160405280929190818152602001828054611aa390613e96565b8015611af05780601f10611ac557610100808354040283529160200191611af0565b820191906000526020600020905b815481529060010190602001808311611ad357829003601f168201915b505050505081526020019060010190611a58565b505050509050919050565b6000818152600260205260408120546001600160a01b0316806107fa5760405162461bcd60e51b815260206004820152602960248201527f4552433732313a206f776e657220717565727920666f72206e6f6e657869737460448201527f656e7420746f6b656e00000000000000000000000000000000000000000000006064820152608401610918565b60006001600160a01b038216611c185760405162461bcd60e51b815260206004820152602a60248201527f4552433732313a2062616c616e636520717565727920666f7220746865207a6560448201527f726f2061646472657373000000000000000000000000000000000000000000006064820152608401610918565b506001600160a01b031660009081526003602052604090205490565b3360009081527f13da86008ba1c6922daee3e07db95305ef49ebced9f5467a0b8613fcc6b343e3602052604090205460ff16611cb25760405162461bcd60e51b815260206004820152601c60248201527f4d75737420626520616e2061646d696e20746f207769746864726177000000006044820152606401610918565b60405133904780156108fc02916000818181858888f19350505050611cd657600080fd5b565b60606001805461080f90613e96565b6000818152600e6020526040902054611d425760405162461bcd60e51b815260206004820152601160248201527f417070204944206d7573742065786973740000000000000000000000000000006044820152606401610918565b6000611d4d60085490565b90506000611d5c826001613df1565b9050611d683382612826565b6000818152600260205260409020546001600160a01b0316611d8957600080fd5b6000818152601060209081526040808320869055858352600e90915290206004018054610a6a918391611dbb90613e96565b80601f0160208091040260200160405190810160405280929190818152602001828054611de790613e96565b8015611e345780601f10611e0957610100808354040283529160200191611e34565b820191906000526020600020905b815481529060010190602001808311611e1757829003601f168201915b5050505050612840565b3360009081527f13da86008ba1c6922daee3e07db95305ef49ebced9f5467a0b8613fcc6b343e3602052604090205460ff16611ee25760405162461bcd60e51b815260206004820152602860248201527f4d75737420626520616e2061646d696e20746f206368616e676520616e79206160448201527f7070726f76616c730000000000000000000000000000000000000000000000006064820152608401610918565b6000918252600f6020526040909120805460ff1916911515919091179055565b6001600160a01b038216331415611f5b5760405162461bcd60e51b815260206004820152601960248201527f4552433732313a20617070726f766520746f2063616c6c6572000000000000006044820152606401610918565b3360008181526005602090815260408083206001600160a01b03871680855290835292819020805460ff191686151590811790915590519081529192917f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31910160405180910390a35050565b611fd13383612398565b6120435760405162461bcd60e51b815260206004820152603160248201527f4552433732313a207472616e736665722063616c6c6572206973206e6f74206f60448201527f776e6572206e6f7220617070726f7665640000000000000000000000000000006064820152608401610918565b61204f848484846128e9565b50505050565b6000816040516020016120689190613bbb565b604051602081830303815290604052805190602001208360405160200161208f9190613bbb565b6040516020818303038152906040528051906020012014905092915050565b60606107fa82612972565b3360009081527f13da86008ba1c6922daee3e07db95305ef49ebced9f5467a0b8613fcc6b343e3602052604090205460ff1661215d5760405162461bcd60e51b815260206004820152602c60248201527f4d75737420626520616e2061646d696e20746f2073657420646576656c6f706560448201527f72206f6e626f617264696e6700000000000000000000000000000000000000006064820152608401610918565b600d805460ff1916911515919091179055565b6000828152600a602052604090206001015461218c8133612681565b610a6a83836127a3565b6000828152600260205260409020546060906001600160a01b03166122235760405162461bcd60e51b815260206004820152602660248201527f546f6b656e204944206d75737420657869737420746f2067657420707265666560448201527f72656e63657300000000000000000000000000000000000000000000000000006064820152608401610918565b600083815260116020526040908190209051612240908490613bbb565b9081526020016040518091039020805461225990613e96565b80601f016020809104026020016040519081016040528092919081815260200182805461228590613e96565b80156122d25780601f106122a7576101008083540402835291602001916122d2565b820191906000526020600020905b8154815290600101906020018083116122b557829003601f168201915b5050505050905092915050565b60006001600160e01b031982167f7965db0b0000000000000000000000000000000000000000000000000000000014806107fa57506107fa82612afd565b6000818152600460205260409020805473ffffffffffffffffffffffffffffffffffffffff19166001600160a01b038416908117909155819061235f82611b0f565b6001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45050565b6000818152600260205260408120546001600160a01b03166124225760405162461bcd60e51b815260206004820152602c60248201527f4552433732313a206f70657261746f7220717565727920666f72206e6f6e657860448201527f697374656e7420746f6b656e00000000000000000000000000000000000000006064820152608401610918565b600061242d83611b0f565b9050806001600160a01b0316846001600160a01b031614806124685750836001600160a01b031661245d84610892565b6001600160a01b0316145b806118f657506001600160a01b0380821660009081526005602090815260408083209388168352929052205460ff166118f6565b826001600160a01b03166124af82611b0f565b6001600160a01b03161461252b5760405162461bcd60e51b815260206004820152602960248201527f4552433732313a207472616e73666572206f6620746f6b656e2074686174206960448201527f73206e6f74206f776e00000000000000000000000000000000000000000000006064820152608401610918565b6001600160a01b0382166125a65760405162461bcd60e51b8152602060048201526024808201527f4552433732313a207472616e7366657220746f20746865207a65726f2061646460448201527f72657373000000000000000000000000000000000000000000000000000000006064820152608401610918565b6125b1838383612b3b565b6125bc60008261231d565b6001600160a01b03831660009081526003602052604081208054600192906125e5908490613e3c565b90915550506001600160a01b0382166000908152600360205260408120805460019290612613908490613df1565b9091555050600081815260026020526040808220805473ffffffffffffffffffffffffffffffffffffffff19166001600160a01b0386811691821790925591518493918716917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef91a4505050565b6000828152600a602090815260408083206001600160a01b038516845290915290205460ff16610f7c576126bf816001600160a01b03166014612b46565b6126ca836020612b46565b6040516020016126db929190613c06565b60408051601f198184030181529082905262461bcd60e51b825261091891600401613d87565b6000828152600a602090815260408083206001600160a01b038516845290915290205460ff16610f7c576000828152600a602090815260408083206001600160a01b03851684529091529020805460ff1916600117905561275f3390565b6001600160a01b0316816001600160a01b0316837f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45050565b6000828152600a602090815260408083206001600160a01b038516845290915290205460ff1615610f7c576000828152600a602090815260408083206001600160a01b0385168085529252808320805460ff1916905551339285917ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b9190a45050565b610f7c828260405180602001604052806000815250612d76565b6000828152600260205260409020546001600160a01b03166128ca5760405162461bcd60e51b815260206004820152602e60248201527f45524337323155524953746f726167653a2055524920736574206f66206e6f6e60448201527f6578697374656e7420746f6b656e0000000000000000000000000000000000006064820152608401610918565b6000828152600b602090815260409091208251610a6a928401906135f6565b6128f484848461249c565b61290084848484612dff565b61204f5760405162461bcd60e51b815260206004820152603260248201527f4552433732313a207472616e7366657220746f206e6f6e20455243373231526560448201527f63656976657220696d706c656d656e74657200000000000000000000000000006064820152608401610918565b6000818152600260205260409020546060906001600160a01b03166129ff5760405162461bcd60e51b815260206004820152603160248201527f45524337323155524953746f726167653a2055524920717565727920666f722060448201527f6e6f6e6578697374656e7420746f6b656e0000000000000000000000000000006064820152608401610918565b6000828152600b602052604081208054612a1890613e96565b80601f0160208091040260200160405190810160405280929190818152602001828054612a4490613e96565b8015612a915780601f10612a6657610100808354040283529160200191612a91565b820191906000526020600020905b815481529060010190602001808311612a7457829003601f168201915b505050505090506000612aaf60408051602081019091526000815290565b9050805160001415612ac2575092915050565b815115612af4578082604051602001612adc929190613bd7565b60405160208183030381529060405292505050919050565b6118f684612f91565b60006001600160e01b031982167f780e9d630000000000000000000000000000000000000000000000000000000014806107fa57506107fa82613086565b610a6a838383613121565b60606000612b55836002613e1d565b612b60906002613df1565b67ffffffffffffffff811115612b7857612b78613f52565b6040519080825280601f01601f191660200182016040528015612ba2576020820181803683370190505b5090507f300000000000000000000000000000000000000000000000000000000000000081600081518110612bd957612bd9613f3c565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a9053507f780000000000000000000000000000000000000000000000000000000000000081600181518110612c3c57612c3c613f3c565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a9053506000612c78846002613e1d565b612c83906001613df1565b90505b6001811115612d20577f303132333435363738396162636465660000000000000000000000000000000085600f1660108110612cc457612cc4613f3c565b1a60f81b828281518110612cda57612cda613f3c565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a90535060049490941c93612d1981613e7f565b9050612c86565b508315612d6f5760405162461bcd60e51b815260206004820181905260248201527f537472696e67733a20686578206c656e67746820696e73756666696369656e746044820152606401610918565b9392505050565b612d8083836131d9565b612d8d6000848484612dff565b610a6a5760405162461bcd60e51b815260206004820152603260248201527f4552433732313a207472616e7366657220746f206e6f6e20455243373231526560448201527f63656976657220696d706c656d656e74657200000000000000000000000000006064820152608401610918565b60006001600160a01b0384163b15612f89576040517f150b7a020000000000000000000000000000000000000000000000000000000081526001600160a01b0385169063150b7a0290612e5c903390899088908890600401613c87565b602060405180830381600087803b158015612e7657600080fd5b505af1925050508015612ea6575060408051601f3d908101601f19168201909252612ea39181019061391f565b60015b612f56573d808015612ed4576040519150601f19603f3d011682016040523d82523d6000602084013e612ed9565b606091505b508051612f4e5760405162461bcd60e51b815260206004820152603260248201527f4552433732313a207472616e7366657220746f206e6f6e20455243373231526560448201527f63656976657220696d706c656d656e74657200000000000000000000000000006064820152608401610918565b805181602001fd5b6001600160e01b0319167f150b7a02000000000000000000000000000000000000000000000000000000001490506118f6565b5060016118f6565b6000818152600260205260409020546060906001600160a01b031661301e5760405162461bcd60e51b815260206004820152602f60248201527f4552433732314d657461646174613a2055524920717565727920666f72206e6f60448201527f6e6578697374656e7420746f6b656e00000000000000000000000000000000006064820152608401610918565b600061303560408051602081019091526000815290565b905060008151116130555760405180602001604052806000815250612d6f565b8061305f84613334565b604051602001613070929190613bd7565b6040516020818303038152906040529392505050565b60006001600160e01b031982167f80ac58cd0000000000000000000000000000000000000000000000000000000014806130e957506001600160e01b031982167f5b5e139f00000000000000000000000000000000000000000000000000000000145b806107fa57507f01ffc9a7000000000000000000000000000000000000000000000000000000006001600160e01b03198316146107fa565b6001600160a01b03831661317c5761317781600880546000838152600960205260408120829055600182018355919091527ff3f7a9fe364faab93b216da50a3214154f22a0a2b415b23a84c8169e8b636ee30155565b61319f565b816001600160a01b0316836001600160a01b03161461319f5761319f8382613466565b6001600160a01b0382166131b657610a6a81613503565b826001600160a01b0316826001600160a01b031614610a6a57610a6a82826135b2565b6001600160a01b03821661322f5760405162461bcd60e51b815260206004820181905260248201527f4552433732313a206d696e7420746f20746865207a65726f20616464726573736044820152606401610918565b6000818152600260205260409020546001600160a01b0316156132945760405162461bcd60e51b815260206004820152601c60248201527f4552433732313a20746f6b656e20616c7265616479206d696e746564000000006044820152606401610918565b6132a060008383612b3b565b6001600160a01b03821660009081526003602052604081208054600192906132c9908490613df1565b9091555050600081815260026020526040808220805473ffffffffffffffffffffffffffffffffffffffff19166001600160a01b03861690811790915590518392907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef908290a45050565b60608161337457505060408051808201909152600181527f3000000000000000000000000000000000000000000000000000000000000000602082015290565b8160005b811561339e578061338881613ecb565b91506133979050600a83613e09565b9150613378565b60008167ffffffffffffffff8111156133b9576133b9613f52565b6040519080825280601f01601f1916602001820160405280156133e3576020820181803683370190505b5090505b84156118f6576133f8600183613e3c565b9150613405600a86613ee6565b613410906030613df1565b60f81b81838151811061342557613425613f3c565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a90535061345f600a86613e09565b94506133e7565b6000600161347384611b9a565b61347d9190613e3c565b6000838152600760205260409020549091508082146134d0576001600160a01b03841660009081526006602090815260408083208584528252808320548484528184208190558352600790915290208190555b5060009182526007602090815260408084208490556001600160a01b039094168352600681528383209183525290812055565b60085460009061351590600190613e3c565b6000838152600960205260408120546008805493945090928490811061353d5761353d613f3c565b90600052602060002001549050806008838154811061355e5761355e613f3c565b600091825260208083209091019290925582815260099091526040808220849055858252812055600880548061359657613596613f26565b6001900381819060005260206000200160009055905550505050565b60006135bd83611b9a565b6001600160a01b039093166000908152600660209081526040808320868452825280832085905593825260079052919091209190915550565b82805461360290613e96565b90600052602060002090601f016020900481019282613624576000855561366a565b82601f1061363d57805160ff191683800117855561366a565b8280016001018555821561366a579182015b8281111561366a57825182559160200191906001019061364f565b5061367692915061367a565b5090565b5b80821115613676576000815560010161367b565b600067ffffffffffffffff808411156136aa576136aa613f52565b604051601f8501601f19908116603f011681019082821181831017156136d2576136d2613f52565b816040528093508581528686860111156136eb57600080fd5b858560208301376000602087830101525050509392505050565b80356001600160a01b038116811461371c57600080fd5b919050565b8035801515811461371c57600080fd5b600082601f83011261374257600080fd5b612d6f8383356020850161368f565b60006020828403121561376357600080fd5b612d6f82613705565b6000806040838503121561377f57600080fd5b61378883613705565b915061379660208401613705565b90509250929050565b6000806000606084860312156137b457600080fd5b6137bd84613705565b92506137cb60208501613705565b9150604084013590509250925092565b600080600080608085870312156137f157600080fd5b6137fa85613705565b935061380860208601613705565b925060408501359150606085013567ffffffffffffffff81111561382b57600080fd5b8501601f8101871361383c57600080fd5b61384b8782356020840161368f565b91505092959194509250565b6000806040838503121561386a57600080fd5b61387383613705565b915061379660208401613721565b6000806040838503121561389457600080fd5b61389d83613705565b946020939093013593505050565b6000602082840312156138bd57600080fd5b612d6f82613721565b6000602082840312156138d857600080fd5b5035919050565b600080604083850312156138f257600080fd5b8235915061379660208401613705565b60006020828403121561391457600080fd5b8135612d6f81613f68565b60006020828403121561393157600080fd5b8151612d6f81613f68565b6000806040838503121561394f57600080fd5b823567ffffffffffffffff8082111561396757600080fd5b61397386838701613731565b9350602085013591508082111561398957600080fd5b5061399685828601613731565b9150509250929050565b600080600080608085870312156139b657600080fd5b843567ffffffffffffffff808211156139ce57600080fd5b6139da88838901613731565b955060208701359150808211156139f057600080fd5b6139fc88838901613731565b9450604087013593506060870135915080821115613a1957600080fd5b5061384b87828801613731565b60008060408385031215613a3957600080fd5b8235915061379660208401613721565b60008060408385031215613a5c57600080fd5b82359150602083013567ffffffffffffffff811115613a7a57600080fd5b61399685828601613731565b600080600060608486031215613a9b57600080fd5b83359250602084013567ffffffffffffffff80821115613aba57600080fd5b613ac687838801613731565b93506040860135915080821115613adc57600080fd5b50613ae986828701613731565b9150509250925092565b600080600080600060a08688031215613b0b57600080fd5b85359450602086013567ffffffffffffffff80821115613b2a57600080fd5b613b3689838a01613731565b95506040880135915080821115613b4c57600080fd5b613b5889838a01613731565b9450606088013593506080880135915080821115613b7557600080fd5b50613b8288828901613731565b9150509295509295909350565b60008151808452613ba7816020860160208601613e53565b601f01601f19169290920160200192915050565b60008251613bcd818460208701613e53565b9190910192915050565b60008351613be9818460208801613e53565b835190830190613bfd818360208801613e53565b01949350505050565b7f416363657373436f6e74726f6c3a206163636f756e7420000000000000000000815260008351613c3e816017850160208801613e53565b7f206973206d697373696e6720726f6c65200000000000000000000000000000006017918401918201528351613c7b816028840160208801613e53565b01602801949350505050565b60006001600160a01b03808716835280861660208401525083604083015260806060830152613cb96080830184613b8f565b9695505050505050565b6000602080830181845280855180835260408601915060408160051b870101925083870160005b82811015613d36577fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc0888603018452613d24858351613b8f565b94509285019290850190600101613cea565b5092979650505050505050565b6020808252825182820181905260009190848201906040850190845b81811015613d7b57835183529284019291840191600101613d5f565b50909695505050505050565b602081526000612d6f6020830184613b8f565b60a081526000613dad60a0830188613b8f565b8281036020840152613dbf8188613b8f565b90508281036040840152613dd38187613b8f565b6001600160a01b039590951660608401525050608001529392505050565b60008219821115613e0457613e04613efa565b500190565b600082613e1857613e18613f10565b500490565b6000816000190483118215151615613e3757613e37613efa565b500290565b600082821015613e4e57613e4e613efa565b500390565b60005b83811015613e6e578181015183820152602001613e56565b8381111561204f5750506000910152565b600081613e8e57613e8e613efa565b506000190190565b600181811c90821680613eaa57607f821691505b60208210811415610eee57634e487b7160e01b600052602260045260246000fd5b6000600019821415613edf57613edf613efa565b5060010190565b600082613ef557613ef5613f10565b500690565b634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052601260045260246000fd5b634e487b7160e01b600052603160045260246000fd5b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052604160045260246000fd5b6001600160e01b031981168114613f7e57600080fd5b5056fea2646970667358221220bb03cda73fdeb4a2ff265bf1e27ac3e77aac8a7e8d2a2c5e193c6b624cb1d42064736f6c63430008060033";
var linkReferences = {
};
var deployedLinkReferences = {
};
var abi$1 = {
	_format: _format,
	contractName: contractName,
	sourceName: sourceName,
	abi: abi,
	bytecode: bytecode,
	deployedBytecode: deployedBytecode,
	linkReferences: linkReferences,
	deployedLinkReferences: deployedLinkReferences
};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

function getCjsExportFromNamespace (n) {
	return n && n['default'] || n;
}

var safeBuffer = createCommonjsModule(function (module, exports) {
/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
/* eslint-disable node/no-deprecated-api */

var Buffer = buffer.Buffer;

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key];
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer;
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports);
  exports.Buffer = SafeBuffer;
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.prototype = Object.create(Buffer.prototype);

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer);

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
};

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size);
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding);
    } else {
      buf.fill(fill);
    }
  } else {
    buf.fill(0);
  }
  return buf
};

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
};

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
};
});

// base-x encoding / decoding
// Copyright (c) 2018 base-x contributors
// Copyright (c) 2014-2018 The Bitcoin Core developers (base58.cpp)
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.
// @ts-ignore
var _Buffer = safeBuffer.Buffer;
function base (ALPHABET) {
  if (ALPHABET.length >= 255) { throw new TypeError('Alphabet too long') }
  var BASE_MAP = new Uint8Array(256);
  for (var j = 0; j < BASE_MAP.length; j++) {
    BASE_MAP[j] = 255;
  }
  for (var i = 0; i < ALPHABET.length; i++) {
    var x = ALPHABET.charAt(i);
    var xc = x.charCodeAt(0);
    if (BASE_MAP[xc] !== 255) { throw new TypeError(x + ' is ambiguous') }
    BASE_MAP[xc] = i;
  }
  var BASE = ALPHABET.length;
  var LEADER = ALPHABET.charAt(0);
  var FACTOR = Math.log(BASE) / Math.log(256); // log(BASE) / log(256), rounded up
  var iFACTOR = Math.log(256) / Math.log(BASE); // log(256) / log(BASE), rounded up
  function encode (source) {
    if (Array.isArray(source) || source instanceof Uint8Array) { source = _Buffer.from(source); }
    if (!_Buffer.isBuffer(source)) { throw new TypeError('Expected Buffer') }
    if (source.length === 0) { return '' }
        // Skip & count leading zeroes.
    var zeroes = 0;
    var length = 0;
    var pbegin = 0;
    var pend = source.length;
    while (pbegin !== pend && source[pbegin] === 0) {
      pbegin++;
      zeroes++;
    }
        // Allocate enough space in big-endian base58 representation.
    var size = ((pend - pbegin) * iFACTOR + 1) >>> 0;
    var b58 = new Uint8Array(size);
        // Process the bytes.
    while (pbegin !== pend) {
      var carry = source[pbegin];
            // Apply "b58 = b58 * 256 + ch".
      var i = 0;
      for (var it1 = size - 1; (carry !== 0 || i < length) && (it1 !== -1); it1--, i++) {
        carry += (256 * b58[it1]) >>> 0;
        b58[it1] = (carry % BASE) >>> 0;
        carry = (carry / BASE) >>> 0;
      }
      if (carry !== 0) { throw new Error('Non-zero carry') }
      length = i;
      pbegin++;
    }
        // Skip leading zeroes in base58 result.
    var it2 = size - length;
    while (it2 !== size && b58[it2] === 0) {
      it2++;
    }
        // Translate the result into a string.
    var str = LEADER.repeat(zeroes);
    for (; it2 < size; ++it2) { str += ALPHABET.charAt(b58[it2]); }
    return str
  }
  function decodeUnsafe (source) {
    if (typeof source !== 'string') { throw new TypeError('Expected String') }
    if (source.length === 0) { return _Buffer.alloc(0) }
    var psz = 0;
        // Skip leading spaces.
    if (source[psz] === ' ') { return }
        // Skip and count leading '1's.
    var zeroes = 0;
    var length = 0;
    while (source[psz] === LEADER) {
      zeroes++;
      psz++;
    }
        // Allocate enough space in big-endian base256 representation.
    var size = (((source.length - psz) * FACTOR) + 1) >>> 0; // log(58) / log(256), rounded up.
    var b256 = new Uint8Array(size);
        // Process the characters.
    while (source[psz]) {
            // Decode character
      var carry = BASE_MAP[source.charCodeAt(psz)];
            // Invalid character
      if (carry === 255) { return }
      var i = 0;
      for (var it3 = size - 1; (carry !== 0 || i < length) && (it3 !== -1); it3--, i++) {
        carry += (BASE * b256[it3]) >>> 0;
        b256[it3] = (carry % 256) >>> 0;
        carry = (carry / 256) >>> 0;
      }
      if (carry !== 0) { throw new Error('Non-zero carry') }
      length = i;
      psz++;
    }
        // Skip trailing spaces.
    if (source[psz] === ' ') { return }
        // Skip leading zeroes in b256.
    var it4 = size - length;
    while (it4 !== size && b256[it4] === 0) {
      it4++;
    }
    var vch = _Buffer.allocUnsafe(zeroes + (size - it4));
    vch.fill(0x00, 0, zeroes);
    var j = zeroes;
    while (it4 !== size) {
      vch[j++] = b256[it4++];
    }
    return vch
  }
  function decode (string) {
    var buffer = decodeUnsafe(string);
    if (buffer) { return buffer }
    throw new Error('Non-base' + BASE + ' character')
  }
  return {
    encode: encode,
    decodeUnsafe: decodeUnsafe,
    decode: decode
  }
}
var src = base;

const { Buffer } = buffer;

class Base {
  constructor (name, code, implementation, alphabet) {
    this.name = name;
    this.code = code;
    this.codeBuf = Buffer.from(this.code);
    this.alphabet = alphabet;
    this.engine = implementation(alphabet);
  }

  encode (buf) {
    return this.engine.encode(buf)
  }

  decode (string) {
    for (const char of string) {
      if (this.alphabet && this.alphabet.indexOf(char) < 0) {
        throw new Error(`invalid character '${char}' in '${string}'`)
      }
    }
    return this.engine.decode(string)
  }
}

var base$1 = Base;

const decode = (string, alphabet, bitsPerChar) => {
  // Build the character lookup table:
  const codes = {};
  for (let i = 0; i < alphabet.length; ++i) {
    codes[alphabet[i]] = i;
  }

  // Count the padding bytes:
  let end = string.length;
  while (string[end - 1] === '=') {
    --end;
  }

  // Allocate the output:
  const out = new Uint8Array((end * bitsPerChar / 8) | 0);

  // Parse the data:
  let bits = 0; // Number of bits currently in the buffer
  let buffer = 0; // Bits waiting to be written out, MSB first
  let written = 0; // Next byte to write
  for (let i = 0; i < end; ++i) {
    // Read one character from the string:
    const value = codes[string[i]];
    if (value === undefined) {
      throw new SyntaxError('Invalid character ' + string[i])
    }

    // Append the bits to the buffer:
    buffer = (buffer << bitsPerChar) | value;
    bits += bitsPerChar;

    // Write out some bits if the buffer has a byte's worth:
    if (bits >= 8) {
      bits -= 8;
      out[written++] = 0xff & (buffer >> bits);
    }
  }

  // Verify that we have received just enough bits:
  if (bits >= bitsPerChar || 0xff & (buffer << (8 - bits))) {
    throw new SyntaxError('Unexpected end of data')
  }

  return out
};

const encode = (data, alphabet, bitsPerChar) => {
  const pad = alphabet[alphabet.length - 1] === '=';
  const mask = (1 << bitsPerChar) - 1;
  let out = '';

  let bits = 0; // Number of bits currently in the buffer
  let buffer = 0; // Bits waiting to be written out, MSB first
  for (let i = 0; i < data.length; ++i) {
    // Slurp data into the buffer:
    buffer = (buffer << 8) | data[i];
    bits += 8;

    // Write out as much as we can:
    while (bits > bitsPerChar) {
      bits -= bitsPerChar;
      out += alphabet[mask & (buffer >> bits)];
    }
  }

  // Partial character:
  if (bits) {
    out += alphabet[mask & (buffer << (bitsPerChar - bits))];
  }

  // Add padding characters until we hit a byte boundary:
  if (pad) {
    while ((out.length * bitsPerChar) & 7) {
      out += '=';
    }
  }

  return out
};

var rfc4648 = (bitsPerChar) => (alphabet) => {
  return {
    encode (input) {
      return encode(input, alphabet, bitsPerChar)
    },
    decode (input) {
      return decode(input, alphabet, bitsPerChar)
    }
  }
};

const { Buffer: Buffer$1 } = buffer;



const identity = () => {
  return {
    encode: (data) => Buffer$1.from(data).toString(),
    decode: (string) => Buffer$1.from(string)
  }
};

// name, code, implementation, alphabet
const constants = [
  ['identity', '\x00', identity, ''],
  ['base2', '0', rfc4648(1), '01'],
  ['base8', '7', rfc4648(3), '01234567'],
  ['base10', '9', src, '0123456789'],
  ['base16', 'f', rfc4648(4), '0123456789abcdef'],
  ['base16upper', 'F', rfc4648(4), '0123456789ABCDEF'],
  ['base32hex', 'v', rfc4648(5), '0123456789abcdefghijklmnopqrstuv'],
  ['base32hexupper', 'V', rfc4648(5), '0123456789ABCDEFGHIJKLMNOPQRSTUV'],
  ['base32hexpad', 't', rfc4648(5), '0123456789abcdefghijklmnopqrstuv='],
  ['base32hexpadupper', 'T', rfc4648(5), '0123456789ABCDEFGHIJKLMNOPQRSTUV='],
  ['base32', 'b', rfc4648(5), 'abcdefghijklmnopqrstuvwxyz234567'],
  ['base32upper', 'B', rfc4648(5), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'],
  ['base32pad', 'c', rfc4648(5), 'abcdefghijklmnopqrstuvwxyz234567='],
  ['base32padupper', 'C', rfc4648(5), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567='],
  ['base32z', 'h', rfc4648(5), 'ybndrfg8ejkmcpqxot1uwisza345h769'],
  ['base36', 'k', src, '0123456789abcdefghijklmnopqrstuvwxyz'],
  ['base36upper', 'K', src, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'],
  ['base58btc', 'z', src, '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'],
  ['base58flickr', 'Z', src, '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'],
  ['base64', 'm', rfc4648(6), 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'],
  ['base64pad', 'M', rfc4648(6), 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='],
  ['base64url', 'u', rfc4648(6), 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'],
  ['base64urlpad', 'U', rfc4648(6), 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=']
];

const names = constants.reduce((prev, tupple) => {
  prev[tupple[0]] = new base$1(tupple[0], tupple[1], tupple[2], tupple[3]);
  return prev
}, {});

const codes = constants.reduce((prev, tupple) => {
  prev[tupple[1]] = names[tupple[0]];
  return prev
}, {});

var constants_1 = {
  names,
  codes
};

var src$1 = createCommonjsModule(function (module, exports) {

const { Buffer } = buffer;


/** @typedef {import("./base")} Base */

/**
 * Create a new buffer with the multibase varint+code.
 *
 * @param {string|number} nameOrCode - The multibase name or code number.
 * @param {Buffer} buf - The data to be prefixed with multibase.
 * @returns {Buffer}
 * @throws {Error} Will throw if the encoding is not supported
 */
function multibase (nameOrCode, buf) {
  if (!buf) {
    throw new Error('requires an encoded buffer')
  }
  const enc = encoding(nameOrCode);
  validEncode(enc.name, buf);
  return Buffer.concat([enc.codeBuf, buf])
}

/**
 * Encode data with the specified base and add the multibase prefix.
 *
 * @param {string|number} nameOrCode - The multibase name or code number.
 * @param {Buffer} buf - The data to be encoded.
 * @returns {Buffer}
 * @throws {Error} Will throw if the encoding is not supported
 *
 */
function encode (nameOrCode, buf) {
  const enc = encoding(nameOrCode);

  return Buffer.concat([enc.codeBuf, Buffer.from(enc.encode(buf))])
}

/**
 * Takes a buffer or string encoded with multibase header, decodes it and
 * returns the decoded buffer
 *
 * @param {Buffer|string} data
 * @returns {Buffer}
 * @throws {Error} Will throw if the encoding is not supported
 *
 */
function decode (data) {
  if (Buffer.isBuffer(data)) {
    data = data.toString();
  }
  const prefix = data[0];

  // Make all encodings case-insensitive except the ones that include upper and lower chars in the alphabet
  if (['f', 'F', 'v', 'V', 't', 'T', 'b', 'B', 'c', 'C', 'h', 'k', 'K'].includes(prefix)) {
    data = data.toLowerCase();
  }
  const enc = encoding(data[0]);
  return Buffer.from(enc.decode(data.substring(1)))
}

/**
 * Is the given data multibase encoded?
 *
 * @param {Buffer|string} data
 * @returns {boolean}
 */
function isEncoded (data) {
  if (Buffer.isBuffer(data)) {
    data = data.toString();
  }

  // Ensure bufOrString is a string
  if (Object.prototype.toString.call(data) !== '[object String]') {
    return false
  }

  try {
    const enc = encoding(data[0]);
    return enc.name
  } catch (err) {
    return false
  }
}

/**
 * Validate encoded data
 *
 * @param {string} name
 * @param {Buffer} buf
 * @returns {undefined}
 * @throws {Error} Will throw if the encoding is not supported
 */
function validEncode (name, buf) {
  const enc = encoding(name);
  enc.decode(buf.toString());
}

/**
 * Get the encoding by name or code
 *
 * @param {string} nameOrCode
 * @returns {Base}
 * @throws {Error} Will throw if the encoding is not supported
 */
function encoding (nameOrCode) {
  if (constants_1.names[nameOrCode]) {
    return constants_1.names[nameOrCode]
  } else if (constants_1.codes[nameOrCode]) {
    return constants_1.codes[nameOrCode]
  } else {
    throw new Error(`Unsupported encoding: ${nameOrCode}`)
  }
}

/**
 * Get encoding from data
 *
 * @param {string|Buffer} data
 * @returns {Base}
 * @throws {Error} Will throw if the encoding is not supported
 */
function encodingFromData (data) {
  if (Buffer.isBuffer(data)) {
    data = data.toString();
  }

  return encoding(data[0])
}

exports = module.exports = multibase;
exports.encode = encode;
exports.decode = decode;
exports.isEncoded = isEncoded;
exports.encoding = encoding;
exports.encodingFromData = encodingFromData;
exports.names = Object.freeze(constants_1.names);
exports.codes = Object.freeze(constants_1.codes);
});

var encode_1 = encode$1;

var MSB = 0x80
  , REST = 0x7F
  , MSBALL = ~REST
  , INT = Math.pow(2, 31);

function encode$1(num, out, offset) {
  out = out || [];
  offset = offset || 0;
  var oldOffset = offset;

  while(num >= INT) {
    out[offset++] = (num & 0xFF) | MSB;
    num /= 128;
  }
  while(num & MSBALL) {
    out[offset++] = (num & 0xFF) | MSB;
    num >>>= 7;
  }
  out[offset] = num | 0;
  
  encode$1.bytes = offset - oldOffset + 1;
  
  return out
}

var decode$1 = read;

var MSB$1 = 0x80
  , REST$1 = 0x7F;

function read(buf, offset) {
  var res    = 0
    , offset = offset || 0
    , shift  = 0
    , counter = offset
    , b
    , l = buf.length;

  do {
    if (counter >= l) {
      read.bytes = 0;
      throw new RangeError('Could not decode varint')
    }
    b = buf[counter++];
    res += shift < 28
      ? (b & REST$1) << shift
      : (b & REST$1) * Math.pow(2, shift);
    shift += 7;
  } while (b >= MSB$1)

  read.bytes = counter - offset;

  return res
}

var N1 = Math.pow(2,  7);
var N2 = Math.pow(2, 14);
var N3 = Math.pow(2, 21);
var N4 = Math.pow(2, 28);
var N5 = Math.pow(2, 35);
var N6 = Math.pow(2, 42);
var N7 = Math.pow(2, 49);
var N8 = Math.pow(2, 56);
var N9 = Math.pow(2, 63);

var length = function (value) {
  return (
    value < N1 ? 1
  : value < N2 ? 2
  : value < N3 ? 3
  : value < N4 ? 4
  : value < N5 ? 5
  : value < N6 ? 6
  : value < N7 ? 7
  : value < N8 ? 8
  : value < N9 ? 9
  :              10
  )
};

var varint = {
    encode: encode_1
  , decode: decode$1
  , encodingLength: length
};

/* eslint quote-props: off */

const names$1 = Object.freeze({
  'identity': 0x00,
  'sha1': 0x11,
  'sha2-256': 0x12,
  'sha2-512': 0x13,
  'sha3-512': 0x14,
  'sha3-384': 0x15,
  'sha3-256': 0x16,
  'sha3-224': 0x17,
  'shake-128': 0x18,
  'shake-256': 0x19,
  'keccak-224': 0x1a,
  'keccak-256': 0x1b,
  'keccak-384': 0x1c,
  'keccak-512': 0x1d,
  'blake3': 0x1e,
  'murmur3-128': 0x22,
  'murmur3-32': 0x23,
  'dbl-sha2-256': 0x56,
  'md4': 0xd4,
  'md5': 0xd5,
  'bmt': 0xd6,
  'sha2-256-trunc254-padded': 0x1012,
  'ripemd-128': 0x1052,
  'ripemd-160': 0x1053,
  'ripemd-256': 0x1054,
  'ripemd-320': 0x1055,
  'x11': 0x1100,
  'sm3-256': 0x534d,
  'blake2b-8': 0xb201,
  'blake2b-16': 0xb202,
  'blake2b-24': 0xb203,
  'blake2b-32': 0xb204,
  'blake2b-40': 0xb205,
  'blake2b-48': 0xb206,
  'blake2b-56': 0xb207,
  'blake2b-64': 0xb208,
  'blake2b-72': 0xb209,
  'blake2b-80': 0xb20a,
  'blake2b-88': 0xb20b,
  'blake2b-96': 0xb20c,
  'blake2b-104': 0xb20d,
  'blake2b-112': 0xb20e,
  'blake2b-120': 0xb20f,
  'blake2b-128': 0xb210,
  'blake2b-136': 0xb211,
  'blake2b-144': 0xb212,
  'blake2b-152': 0xb213,
  'blake2b-160': 0xb214,
  'blake2b-168': 0xb215,
  'blake2b-176': 0xb216,
  'blake2b-184': 0xb217,
  'blake2b-192': 0xb218,
  'blake2b-200': 0xb219,
  'blake2b-208': 0xb21a,
  'blake2b-216': 0xb21b,
  'blake2b-224': 0xb21c,
  'blake2b-232': 0xb21d,
  'blake2b-240': 0xb21e,
  'blake2b-248': 0xb21f,
  'blake2b-256': 0xb220,
  'blake2b-264': 0xb221,
  'blake2b-272': 0xb222,
  'blake2b-280': 0xb223,
  'blake2b-288': 0xb224,
  'blake2b-296': 0xb225,
  'blake2b-304': 0xb226,
  'blake2b-312': 0xb227,
  'blake2b-320': 0xb228,
  'blake2b-328': 0xb229,
  'blake2b-336': 0xb22a,
  'blake2b-344': 0xb22b,
  'blake2b-352': 0xb22c,
  'blake2b-360': 0xb22d,
  'blake2b-368': 0xb22e,
  'blake2b-376': 0xb22f,
  'blake2b-384': 0xb230,
  'blake2b-392': 0xb231,
  'blake2b-400': 0xb232,
  'blake2b-408': 0xb233,
  'blake2b-416': 0xb234,
  'blake2b-424': 0xb235,
  'blake2b-432': 0xb236,
  'blake2b-440': 0xb237,
  'blake2b-448': 0xb238,
  'blake2b-456': 0xb239,
  'blake2b-464': 0xb23a,
  'blake2b-472': 0xb23b,
  'blake2b-480': 0xb23c,
  'blake2b-488': 0xb23d,
  'blake2b-496': 0xb23e,
  'blake2b-504': 0xb23f,
  'blake2b-512': 0xb240,
  'blake2s-8': 0xb241,
  'blake2s-16': 0xb242,
  'blake2s-24': 0xb243,
  'blake2s-32': 0xb244,
  'blake2s-40': 0xb245,
  'blake2s-48': 0xb246,
  'blake2s-56': 0xb247,
  'blake2s-64': 0xb248,
  'blake2s-72': 0xb249,
  'blake2s-80': 0xb24a,
  'blake2s-88': 0xb24b,
  'blake2s-96': 0xb24c,
  'blake2s-104': 0xb24d,
  'blake2s-112': 0xb24e,
  'blake2s-120': 0xb24f,
  'blake2s-128': 0xb250,
  'blake2s-136': 0xb251,
  'blake2s-144': 0xb252,
  'blake2s-152': 0xb253,
  'blake2s-160': 0xb254,
  'blake2s-168': 0xb255,
  'blake2s-176': 0xb256,
  'blake2s-184': 0xb257,
  'blake2s-192': 0xb258,
  'blake2s-200': 0xb259,
  'blake2s-208': 0xb25a,
  'blake2s-216': 0xb25b,
  'blake2s-224': 0xb25c,
  'blake2s-232': 0xb25d,
  'blake2s-240': 0xb25e,
  'blake2s-248': 0xb25f,
  'blake2s-256': 0xb260,
  'skein256-8': 0xb301,
  'skein256-16': 0xb302,
  'skein256-24': 0xb303,
  'skein256-32': 0xb304,
  'skein256-40': 0xb305,
  'skein256-48': 0xb306,
  'skein256-56': 0xb307,
  'skein256-64': 0xb308,
  'skein256-72': 0xb309,
  'skein256-80': 0xb30a,
  'skein256-88': 0xb30b,
  'skein256-96': 0xb30c,
  'skein256-104': 0xb30d,
  'skein256-112': 0xb30e,
  'skein256-120': 0xb30f,
  'skein256-128': 0xb310,
  'skein256-136': 0xb311,
  'skein256-144': 0xb312,
  'skein256-152': 0xb313,
  'skein256-160': 0xb314,
  'skein256-168': 0xb315,
  'skein256-176': 0xb316,
  'skein256-184': 0xb317,
  'skein256-192': 0xb318,
  'skein256-200': 0xb319,
  'skein256-208': 0xb31a,
  'skein256-216': 0xb31b,
  'skein256-224': 0xb31c,
  'skein256-232': 0xb31d,
  'skein256-240': 0xb31e,
  'skein256-248': 0xb31f,
  'skein256-256': 0xb320,
  'skein512-8': 0xb321,
  'skein512-16': 0xb322,
  'skein512-24': 0xb323,
  'skein512-32': 0xb324,
  'skein512-40': 0xb325,
  'skein512-48': 0xb326,
  'skein512-56': 0xb327,
  'skein512-64': 0xb328,
  'skein512-72': 0xb329,
  'skein512-80': 0xb32a,
  'skein512-88': 0xb32b,
  'skein512-96': 0xb32c,
  'skein512-104': 0xb32d,
  'skein512-112': 0xb32e,
  'skein512-120': 0xb32f,
  'skein512-128': 0xb330,
  'skein512-136': 0xb331,
  'skein512-144': 0xb332,
  'skein512-152': 0xb333,
  'skein512-160': 0xb334,
  'skein512-168': 0xb335,
  'skein512-176': 0xb336,
  'skein512-184': 0xb337,
  'skein512-192': 0xb338,
  'skein512-200': 0xb339,
  'skein512-208': 0xb33a,
  'skein512-216': 0xb33b,
  'skein512-224': 0xb33c,
  'skein512-232': 0xb33d,
  'skein512-240': 0xb33e,
  'skein512-248': 0xb33f,
  'skein512-256': 0xb340,
  'skein512-264': 0xb341,
  'skein512-272': 0xb342,
  'skein512-280': 0xb343,
  'skein512-288': 0xb344,
  'skein512-296': 0xb345,
  'skein512-304': 0xb346,
  'skein512-312': 0xb347,
  'skein512-320': 0xb348,
  'skein512-328': 0xb349,
  'skein512-336': 0xb34a,
  'skein512-344': 0xb34b,
  'skein512-352': 0xb34c,
  'skein512-360': 0xb34d,
  'skein512-368': 0xb34e,
  'skein512-376': 0xb34f,
  'skein512-384': 0xb350,
  'skein512-392': 0xb351,
  'skein512-400': 0xb352,
  'skein512-408': 0xb353,
  'skein512-416': 0xb354,
  'skein512-424': 0xb355,
  'skein512-432': 0xb356,
  'skein512-440': 0xb357,
  'skein512-448': 0xb358,
  'skein512-456': 0xb359,
  'skein512-464': 0xb35a,
  'skein512-472': 0xb35b,
  'skein512-480': 0xb35c,
  'skein512-488': 0xb35d,
  'skein512-496': 0xb35e,
  'skein512-504': 0xb35f,
  'skein512-512': 0xb360,
  'skein1024-8': 0xb361,
  'skein1024-16': 0xb362,
  'skein1024-24': 0xb363,
  'skein1024-32': 0xb364,
  'skein1024-40': 0xb365,
  'skein1024-48': 0xb366,
  'skein1024-56': 0xb367,
  'skein1024-64': 0xb368,
  'skein1024-72': 0xb369,
  'skein1024-80': 0xb36a,
  'skein1024-88': 0xb36b,
  'skein1024-96': 0xb36c,
  'skein1024-104': 0xb36d,
  'skein1024-112': 0xb36e,
  'skein1024-120': 0xb36f,
  'skein1024-128': 0xb370,
  'skein1024-136': 0xb371,
  'skein1024-144': 0xb372,
  'skein1024-152': 0xb373,
  'skein1024-160': 0xb374,
  'skein1024-168': 0xb375,
  'skein1024-176': 0xb376,
  'skein1024-184': 0xb377,
  'skein1024-192': 0xb378,
  'skein1024-200': 0xb379,
  'skein1024-208': 0xb37a,
  'skein1024-216': 0xb37b,
  'skein1024-224': 0xb37c,
  'skein1024-232': 0xb37d,
  'skein1024-240': 0xb37e,
  'skein1024-248': 0xb37f,
  'skein1024-256': 0xb380,
  'skein1024-264': 0xb381,
  'skein1024-272': 0xb382,
  'skein1024-280': 0xb383,
  'skein1024-288': 0xb384,
  'skein1024-296': 0xb385,
  'skein1024-304': 0xb386,
  'skein1024-312': 0xb387,
  'skein1024-320': 0xb388,
  'skein1024-328': 0xb389,
  'skein1024-336': 0xb38a,
  'skein1024-344': 0xb38b,
  'skein1024-352': 0xb38c,
  'skein1024-360': 0xb38d,
  'skein1024-368': 0xb38e,
  'skein1024-376': 0xb38f,
  'skein1024-384': 0xb390,
  'skein1024-392': 0xb391,
  'skein1024-400': 0xb392,
  'skein1024-408': 0xb393,
  'skein1024-416': 0xb394,
  'skein1024-424': 0xb395,
  'skein1024-432': 0xb396,
  'skein1024-440': 0xb397,
  'skein1024-448': 0xb398,
  'skein1024-456': 0xb399,
  'skein1024-464': 0xb39a,
  'skein1024-472': 0xb39b,
  'skein1024-480': 0xb39c,
  'skein1024-488': 0xb39d,
  'skein1024-496': 0xb39e,
  'skein1024-504': 0xb39f,
  'skein1024-512': 0xb3a0,
  'skein1024-520': 0xb3a1,
  'skein1024-528': 0xb3a2,
  'skein1024-536': 0xb3a3,
  'skein1024-544': 0xb3a4,
  'skein1024-552': 0xb3a5,
  'skein1024-560': 0xb3a6,
  'skein1024-568': 0xb3a7,
  'skein1024-576': 0xb3a8,
  'skein1024-584': 0xb3a9,
  'skein1024-592': 0xb3aa,
  'skein1024-600': 0xb3ab,
  'skein1024-608': 0xb3ac,
  'skein1024-616': 0xb3ad,
  'skein1024-624': 0xb3ae,
  'skein1024-632': 0xb3af,
  'skein1024-640': 0xb3b0,
  'skein1024-648': 0xb3b1,
  'skein1024-656': 0xb3b2,
  'skein1024-664': 0xb3b3,
  'skein1024-672': 0xb3b4,
  'skein1024-680': 0xb3b5,
  'skein1024-688': 0xb3b6,
  'skein1024-696': 0xb3b7,
  'skein1024-704': 0xb3b8,
  'skein1024-712': 0xb3b9,
  'skein1024-720': 0xb3ba,
  'skein1024-728': 0xb3bb,
  'skein1024-736': 0xb3bc,
  'skein1024-744': 0xb3bd,
  'skein1024-752': 0xb3be,
  'skein1024-760': 0xb3bf,
  'skein1024-768': 0xb3c0,
  'skein1024-776': 0xb3c1,
  'skein1024-784': 0xb3c2,
  'skein1024-792': 0xb3c3,
  'skein1024-800': 0xb3c4,
  'skein1024-808': 0xb3c5,
  'skein1024-816': 0xb3c6,
  'skein1024-824': 0xb3c7,
  'skein1024-832': 0xb3c8,
  'skein1024-840': 0xb3c9,
  'skein1024-848': 0xb3ca,
  'skein1024-856': 0xb3cb,
  'skein1024-864': 0xb3cc,
  'skein1024-872': 0xb3cd,
  'skein1024-880': 0xb3ce,
  'skein1024-888': 0xb3cf,
  'skein1024-896': 0xb3d0,
  'skein1024-904': 0xb3d1,
  'skein1024-912': 0xb3d2,
  'skein1024-920': 0xb3d3,
  'skein1024-928': 0xb3d4,
  'skein1024-936': 0xb3d5,
  'skein1024-944': 0xb3d6,
  'skein1024-952': 0xb3d7,
  'skein1024-960': 0xb3d8,
  'skein1024-968': 0xb3d9,
  'skein1024-976': 0xb3da,
  'skein1024-984': 0xb3db,
  'skein1024-992': 0xb3dc,
  'skein1024-1000': 0xb3dd,
  'skein1024-1008': 0xb3de,
  'skein1024-1016': 0xb3df,
  'skein1024-1024': 0xb3e0,
  'poseidon-bls12_381-a2-fc1': 0xb401,
  'poseidon-bls12_381-a2-fc1-sc': 0xb402
});

var constants$1 = { names: names$1 };

var src$2 = createCommonjsModule(function (module, exports) {

const { Buffer } = buffer;


const { names } = constants$1;

const codes = {};

for (const key in names) {
  codes[names[key]] = key;
}
exports.names = names;
exports.codes = Object.freeze(codes);

/**
 * Convert the given multihash to a hex encoded string.
 *
 * @param {Buffer} hash
 * @returns {string}
 */
exports.toHexString = function toHexString (hash) {
  if (!Buffer.isBuffer(hash)) {
    throw new Error('must be passed a buffer')
  }

  return hash.toString('hex')
};

/**
 * Convert the given hex encoded string to a multihash.
 *
 * @param {string} hash
 * @returns {Buffer}
 */
exports.fromHexString = function fromHexString (hash) {
  return Buffer.from(hash, 'hex')
};

/**
 * Convert the given multihash to a base58 encoded string.
 *
 * @param {Buffer} hash
 * @returns {string}
 */
exports.toB58String = function toB58String (hash) {
  if (!Buffer.isBuffer(hash)) {
    throw new Error('must be passed a buffer')
  }

  return src$1.encode('base58btc', hash).toString().slice(1)
};

/**
 * Convert the given base58 encoded string to a multihash.
 *
 * @param {string|Buffer} hash
 * @returns {Buffer}
 */
exports.fromB58String = function fromB58String (hash) {
  let encoded = hash;
  if (Buffer.isBuffer(hash)) {
    encoded = hash.toString();
  }

  return src$1.decode('z' + encoded)
};

/**
 * Decode a hash from the given multihash.
 *
 * @param {Buffer} buf
 * @returns {{code: number, name: string, length: number, digest: Buffer}} result
 */
exports.decode = function decode (buf) {
  if (!(Buffer.isBuffer(buf))) {
    throw new Error('multihash must be a Buffer')
  }

  if (buf.length < 2) {
    throw new Error('multihash too short. must be > 2 bytes.')
  }

  const code = varint.decode(buf);
  if (!exports.isValidCode(code)) {
    throw new Error(`multihash unknown function code: 0x${code.toString(16)}`)
  }
  buf = buf.slice(varint.decode.bytes);

  const len = varint.decode(buf);
  if (len < 0) {
    throw new Error(`multihash invalid length: ${len}`)
  }
  buf = buf.slice(varint.decode.bytes);

  if (buf.length !== len) {
    throw new Error(`multihash length inconsistent: 0x${buf.toString('hex')}`)
  }

  return {
    code,
    name: codes[code],
    length: len,
    digest: buf
  }
};

/**
 *  Encode a hash digest along with the specified function code.
 *
 * > **Note:** the length is derived from the length of the digest itself.
 *
 * @param {Buffer} digest
 * @param {string|number} code
 * @param {number} [length]
 * @returns {Buffer}
 */
exports.encode = function encode (digest, code, length) {
  if (!digest || code === undefined) {
    throw new Error('multihash encode requires at least two args: digest, code')
  }

  // ensure it's a hashfunction code.
  const hashfn = exports.coerceCode(code);

  if (!(Buffer.isBuffer(digest))) {
    throw new Error('digest should be a Buffer')
  }

  if (length == null) {
    length = digest.length;
  }

  if (length && digest.length !== length) {
    throw new Error('digest length should be equal to specified length.')
  }

  return Buffer.concat([
    Buffer.from(varint.encode(hashfn)),
    Buffer.from(varint.encode(length)),
    digest
  ])
};

/**
 * Converts a hash function name into the matching code.
 * If passed a number it will return the number if it's a valid code.
 * @param {string|number} name
 * @returns {number}
 */
exports.coerceCode = function coerceCode (name) {
  let code = name;

  if (typeof name === 'string') {
    if (names[name] === undefined) {
      throw new Error(`Unrecognized hash function named: ${name}`)
    }
    code = names[name];
  }

  if (typeof code !== 'number') {
    throw new Error(`Hash function code should be a number. Got: ${code}`)
  }

  if (codes[code] === undefined && !exports.isAppCode(code)) {
    throw new Error(`Unrecognized function code: ${code}`)
  }

  return code
};

/**
 * Checks wether a code is part of the app range
 *
 * @param {number} code
 * @returns {boolean}
 */
exports.isAppCode = function appCode (code) {
  return code > 0 && code < 0x10
};

/**
 * Checks whether a multihash code is valid.
 *
 * @param {number} code
 * @returns {boolean}
 */
exports.isValidCode = function validCode (code) {
  if (exports.isAppCode(code)) {
    return true
  }

  if (codes[code]) {
    return true
  }

  return false
};

/**
 * Check if the given buffer is a valid multihash. Throws an error if it is not valid.
 *
 * @param {Buffer} multihash
 * @returns {undefined}
 * @throws {Error}
 */
function validate (multihash) {
  exports.decode(multihash); // throws if bad.
}
exports.validate = validate;

/**
 * Returns a prefix from a valid multihash. Throws an error if it is not valid.
 *
 * @param {Buffer} multihash
 * @returns {undefined}
 * @throws {Error}
 */
exports.prefix = function prefix (multihash) {
  validate(multihash);

  return multihash.slice(0, 2)
};
});

var identity$1 = 0;
var ip4 = 4;
var tcp = 6;
var sha1 = 17;
var blake3 = 30;
var dccp = 33;
var ip6 = 41;
var ip6zone = 42;
var path = 47;
var multicodec = 48;
var multihash = 49;
var multiaddr = 50;
var multibase = 51;
var dns = 53;
var dns4 = 54;
var dns6 = 55;
var dnsaddr = 56;
var protobuf = 80;
var cbor = 81;
var raw = 85;
var rlp = 96;
var bencode = 99;
var sctp = 132;
var md4 = 212;
var md5 = 213;
var bmt = 214;
var zeronet = 230;
var udp = 273;
var udt = 301;
var utp = 302;
var unix = 400;
var p2p = 421;
var ipfs = 421;
var https = 443;
var onion = 444;
var onion3 = 445;
var garlic64 = 446;
var garlic32 = 447;
var tls = 448;
var quic = 460;
var ws = 477;
var wss = 478;
var http = 480;
var json = 512;
var messagepack = 513;
var x11 = 4352;
var baseTable = {
	identity: identity$1,
	ip4: ip4,
	tcp: tcp,
	sha1: sha1,
	"sha2-256": 18,
	"sha2-512": 19,
	"sha3-512": 20,
	"sha3-384": 21,
	"sha3-256": 22,
	"sha3-224": 23,
	"shake-128": 24,
	"shake-256": 25,
	"keccak-224": 26,
	"keccak-256": 27,
	"keccak-384": 28,
	"keccak-512": 29,
	blake3: blake3,
	dccp: dccp,
	"murmur3-128": 34,
	"murmur3-32": 35,
	ip6: ip6,
	ip6zone: ip6zone,
	path: path,
	multicodec: multicodec,
	multihash: multihash,
	multiaddr: multiaddr,
	multibase: multibase,
	dns: dns,
	dns4: dns4,
	dns6: dns6,
	dnsaddr: dnsaddr,
	protobuf: protobuf,
	cbor: cbor,
	raw: raw,
	"dbl-sha2-256": 86,
	rlp: rlp,
	bencode: bencode,
	"dag-pb": 112,
	"dag-cbor": 113,
	"libp2p-key": 114,
	"git-raw": 120,
	"torrent-info": 123,
	"torrent-file": 124,
	"leofcoin-block": 129,
	"leofcoin-tx": 130,
	"leofcoin-pr": 131,
	sctp: sctp,
	"dag-jose": 133,
	"dag-cose": 134,
	"eth-block": 144,
	"eth-block-list": 145,
	"eth-tx-trie": 146,
	"eth-tx": 147,
	"eth-tx-receipt-trie": 148,
	"eth-tx-receipt": 149,
	"eth-state-trie": 150,
	"eth-account-snapshot": 151,
	"eth-storage-trie": 152,
	"bitcoin-block": 176,
	"bitcoin-tx": 177,
	"bitcoin-witness-commitment": 178,
	"zcash-block": 192,
	"zcash-tx": 193,
	"stellar-block": 208,
	"stellar-tx": 209,
	md4: md4,
	md5: md5,
	bmt: bmt,
	"decred-block": 224,
	"decred-tx": 225,
	"ipld-ns": 226,
	"ipfs-ns": 227,
	"swarm-ns": 228,
	"ipns-ns": 229,
	zeronet: zeronet,
	"secp256k1-pub": 231,
	"bls12_381-g1-pub": 234,
	"bls12_381-g2-pub": 235,
	"x25519-pub": 236,
	"ed25519-pub": 237,
	"dash-block": 240,
	"dash-tx": 241,
	"swarm-manifest": 250,
	"swarm-feed": 251,
	udp: udp,
	"p2p-webrtc-star": 275,
	"p2p-webrtc-direct": 276,
	"p2p-stardust": 277,
	"p2p-circuit": 290,
	"dag-json": 297,
	udt: udt,
	utp: utp,
	unix: unix,
	p2p: p2p,
	ipfs: ipfs,
	https: https,
	onion: onion,
	onion3: onion3,
	garlic64: garlic64,
	garlic32: garlic32,
	tls: tls,
	quic: quic,
	ws: ws,
	wss: wss,
	"p2p-websocket-star": 479,
	http: http,
	json: json,
	messagepack: messagepack,
	"libp2p-peer-record": 769,
	"sha2-256-trunc254-padded": 4114,
	"ripemd-128": 4178,
	"ripemd-160": 4179,
	"ripemd-256": 4180,
	"ripemd-320": 4181,
	x11: x11,
	"sm3-256": 21325,
	"blake2b-8": 45569,
	"blake2b-16": 45570,
	"blake2b-24": 45571,
	"blake2b-32": 45572,
	"blake2b-40": 45573,
	"blake2b-48": 45574,
	"blake2b-56": 45575,
	"blake2b-64": 45576,
	"blake2b-72": 45577,
	"blake2b-80": 45578,
	"blake2b-88": 45579,
	"blake2b-96": 45580,
	"blake2b-104": 45581,
	"blake2b-112": 45582,
	"blake2b-120": 45583,
	"blake2b-128": 45584,
	"blake2b-136": 45585,
	"blake2b-144": 45586,
	"blake2b-152": 45587,
	"blake2b-160": 45588,
	"blake2b-168": 45589,
	"blake2b-176": 45590,
	"blake2b-184": 45591,
	"blake2b-192": 45592,
	"blake2b-200": 45593,
	"blake2b-208": 45594,
	"blake2b-216": 45595,
	"blake2b-224": 45596,
	"blake2b-232": 45597,
	"blake2b-240": 45598,
	"blake2b-248": 45599,
	"blake2b-256": 45600,
	"blake2b-264": 45601,
	"blake2b-272": 45602,
	"blake2b-280": 45603,
	"blake2b-288": 45604,
	"blake2b-296": 45605,
	"blake2b-304": 45606,
	"blake2b-312": 45607,
	"blake2b-320": 45608,
	"blake2b-328": 45609,
	"blake2b-336": 45610,
	"blake2b-344": 45611,
	"blake2b-352": 45612,
	"blake2b-360": 45613,
	"blake2b-368": 45614,
	"blake2b-376": 45615,
	"blake2b-384": 45616,
	"blake2b-392": 45617,
	"blake2b-400": 45618,
	"blake2b-408": 45619,
	"blake2b-416": 45620,
	"blake2b-424": 45621,
	"blake2b-432": 45622,
	"blake2b-440": 45623,
	"blake2b-448": 45624,
	"blake2b-456": 45625,
	"blake2b-464": 45626,
	"blake2b-472": 45627,
	"blake2b-480": 45628,
	"blake2b-488": 45629,
	"blake2b-496": 45630,
	"blake2b-504": 45631,
	"blake2b-512": 45632,
	"blake2s-8": 45633,
	"blake2s-16": 45634,
	"blake2s-24": 45635,
	"blake2s-32": 45636,
	"blake2s-40": 45637,
	"blake2s-48": 45638,
	"blake2s-56": 45639,
	"blake2s-64": 45640,
	"blake2s-72": 45641,
	"blake2s-80": 45642,
	"blake2s-88": 45643,
	"blake2s-96": 45644,
	"blake2s-104": 45645,
	"blake2s-112": 45646,
	"blake2s-120": 45647,
	"blake2s-128": 45648,
	"blake2s-136": 45649,
	"blake2s-144": 45650,
	"blake2s-152": 45651,
	"blake2s-160": 45652,
	"blake2s-168": 45653,
	"blake2s-176": 45654,
	"blake2s-184": 45655,
	"blake2s-192": 45656,
	"blake2s-200": 45657,
	"blake2s-208": 45658,
	"blake2s-216": 45659,
	"blake2s-224": 45660,
	"blake2s-232": 45661,
	"blake2s-240": 45662,
	"blake2s-248": 45663,
	"blake2s-256": 45664,
	"skein256-8": 45825,
	"skein256-16": 45826,
	"skein256-24": 45827,
	"skein256-32": 45828,
	"skein256-40": 45829,
	"skein256-48": 45830,
	"skein256-56": 45831,
	"skein256-64": 45832,
	"skein256-72": 45833,
	"skein256-80": 45834,
	"skein256-88": 45835,
	"skein256-96": 45836,
	"skein256-104": 45837,
	"skein256-112": 45838,
	"skein256-120": 45839,
	"skein256-128": 45840,
	"skein256-136": 45841,
	"skein256-144": 45842,
	"skein256-152": 45843,
	"skein256-160": 45844,
	"skein256-168": 45845,
	"skein256-176": 45846,
	"skein256-184": 45847,
	"skein256-192": 45848,
	"skein256-200": 45849,
	"skein256-208": 45850,
	"skein256-216": 45851,
	"skein256-224": 45852,
	"skein256-232": 45853,
	"skein256-240": 45854,
	"skein256-248": 45855,
	"skein256-256": 45856,
	"skein512-8": 45857,
	"skein512-16": 45858,
	"skein512-24": 45859,
	"skein512-32": 45860,
	"skein512-40": 45861,
	"skein512-48": 45862,
	"skein512-56": 45863,
	"skein512-64": 45864,
	"skein512-72": 45865,
	"skein512-80": 45866,
	"skein512-88": 45867,
	"skein512-96": 45868,
	"skein512-104": 45869,
	"skein512-112": 45870,
	"skein512-120": 45871,
	"skein512-128": 45872,
	"skein512-136": 45873,
	"skein512-144": 45874,
	"skein512-152": 45875,
	"skein512-160": 45876,
	"skein512-168": 45877,
	"skein512-176": 45878,
	"skein512-184": 45879,
	"skein512-192": 45880,
	"skein512-200": 45881,
	"skein512-208": 45882,
	"skein512-216": 45883,
	"skein512-224": 45884,
	"skein512-232": 45885,
	"skein512-240": 45886,
	"skein512-248": 45887,
	"skein512-256": 45888,
	"skein512-264": 45889,
	"skein512-272": 45890,
	"skein512-280": 45891,
	"skein512-288": 45892,
	"skein512-296": 45893,
	"skein512-304": 45894,
	"skein512-312": 45895,
	"skein512-320": 45896,
	"skein512-328": 45897,
	"skein512-336": 45898,
	"skein512-344": 45899,
	"skein512-352": 45900,
	"skein512-360": 45901,
	"skein512-368": 45902,
	"skein512-376": 45903,
	"skein512-384": 45904,
	"skein512-392": 45905,
	"skein512-400": 45906,
	"skein512-408": 45907,
	"skein512-416": 45908,
	"skein512-424": 45909,
	"skein512-432": 45910,
	"skein512-440": 45911,
	"skein512-448": 45912,
	"skein512-456": 45913,
	"skein512-464": 45914,
	"skein512-472": 45915,
	"skein512-480": 45916,
	"skein512-488": 45917,
	"skein512-496": 45918,
	"skein512-504": 45919,
	"skein512-512": 45920,
	"skein1024-8": 45921,
	"skein1024-16": 45922,
	"skein1024-24": 45923,
	"skein1024-32": 45924,
	"skein1024-40": 45925,
	"skein1024-48": 45926,
	"skein1024-56": 45927,
	"skein1024-64": 45928,
	"skein1024-72": 45929,
	"skein1024-80": 45930,
	"skein1024-88": 45931,
	"skein1024-96": 45932,
	"skein1024-104": 45933,
	"skein1024-112": 45934,
	"skein1024-120": 45935,
	"skein1024-128": 45936,
	"skein1024-136": 45937,
	"skein1024-144": 45938,
	"skein1024-152": 45939,
	"skein1024-160": 45940,
	"skein1024-168": 45941,
	"skein1024-176": 45942,
	"skein1024-184": 45943,
	"skein1024-192": 45944,
	"skein1024-200": 45945,
	"skein1024-208": 45946,
	"skein1024-216": 45947,
	"skein1024-224": 45948,
	"skein1024-232": 45949,
	"skein1024-240": 45950,
	"skein1024-248": 45951,
	"skein1024-256": 45952,
	"skein1024-264": 45953,
	"skein1024-272": 45954,
	"skein1024-280": 45955,
	"skein1024-288": 45956,
	"skein1024-296": 45957,
	"skein1024-304": 45958,
	"skein1024-312": 45959,
	"skein1024-320": 45960,
	"skein1024-328": 45961,
	"skein1024-336": 45962,
	"skein1024-344": 45963,
	"skein1024-352": 45964,
	"skein1024-360": 45965,
	"skein1024-368": 45966,
	"skein1024-376": 45967,
	"skein1024-384": 45968,
	"skein1024-392": 45969,
	"skein1024-400": 45970,
	"skein1024-408": 45971,
	"skein1024-416": 45972,
	"skein1024-424": 45973,
	"skein1024-432": 45974,
	"skein1024-440": 45975,
	"skein1024-448": 45976,
	"skein1024-456": 45977,
	"skein1024-464": 45978,
	"skein1024-472": 45979,
	"skein1024-480": 45980,
	"skein1024-488": 45981,
	"skein1024-496": 45982,
	"skein1024-504": 45983,
	"skein1024-512": 45984,
	"skein1024-520": 45985,
	"skein1024-528": 45986,
	"skein1024-536": 45987,
	"skein1024-544": 45988,
	"skein1024-552": 45989,
	"skein1024-560": 45990,
	"skein1024-568": 45991,
	"skein1024-576": 45992,
	"skein1024-584": 45993,
	"skein1024-592": 45994,
	"skein1024-600": 45995,
	"skein1024-608": 45996,
	"skein1024-616": 45997,
	"skein1024-624": 45998,
	"skein1024-632": 45999,
	"skein1024-640": 46000,
	"skein1024-648": 46001,
	"skein1024-656": 46002,
	"skein1024-664": 46003,
	"skein1024-672": 46004,
	"skein1024-680": 46005,
	"skein1024-688": 46006,
	"skein1024-696": 46007,
	"skein1024-704": 46008,
	"skein1024-712": 46009,
	"skein1024-720": 46010,
	"skein1024-728": 46011,
	"skein1024-736": 46012,
	"skein1024-744": 46013,
	"skein1024-752": 46014,
	"skein1024-760": 46015,
	"skein1024-768": 46016,
	"skein1024-776": 46017,
	"skein1024-784": 46018,
	"skein1024-792": 46019,
	"skein1024-800": 46020,
	"skein1024-808": 46021,
	"skein1024-816": 46022,
	"skein1024-824": 46023,
	"skein1024-832": 46024,
	"skein1024-840": 46025,
	"skein1024-848": 46026,
	"skein1024-856": 46027,
	"skein1024-864": 46028,
	"skein1024-872": 46029,
	"skein1024-880": 46030,
	"skein1024-888": 46031,
	"skein1024-896": 46032,
	"skein1024-904": 46033,
	"skein1024-912": 46034,
	"skein1024-920": 46035,
	"skein1024-928": 46036,
	"skein1024-936": 46037,
	"skein1024-944": 46038,
	"skein1024-952": 46039,
	"skein1024-960": 46040,
	"skein1024-968": 46041,
	"skein1024-976": 46042,
	"skein1024-984": 46043,
	"skein1024-992": 46044,
	"skein1024-1000": 46045,
	"skein1024-1008": 46046,
	"skein1024-1016": 46047,
	"skein1024-1024": 46048,
	"poseidon-bls12_381-a2-fc1": 46081,
	"poseidon-bls12_381-a2-fc1-sc": 46082,
	"zeroxcert-imprint-256": 52753,
	"fil-commitment-unsealed": 61697,
	"fil-commitment-sealed": 61698,
	"holochain-adr-v0": 8417572,
	"holochain-adr-v1": 8483108,
	"holochain-key-v0": 9728292,
	"holochain-key-v1": 9793828,
	"holochain-sig-v0": 10645796,
	"holochain-sig-v1": 10711332
};

var baseTable$1 = {
	__proto__: null,
	identity: identity$1,
	ip4: ip4,
	tcp: tcp,
	sha1: sha1,
	blake3: blake3,
	dccp: dccp,
	ip6: ip6,
	ip6zone: ip6zone,
	path: path,
	multicodec: multicodec,
	multihash: multihash,
	multiaddr: multiaddr,
	multibase: multibase,
	dns: dns,
	dns4: dns4,
	dns6: dns6,
	dnsaddr: dnsaddr,
	protobuf: protobuf,
	cbor: cbor,
	raw: raw,
	rlp: rlp,
	bencode: bencode,
	sctp: sctp,
	md4: md4,
	md5: md5,
	bmt: bmt,
	zeronet: zeronet,
	udp: udp,
	udt: udt,
	utp: utp,
	unix: unix,
	p2p: p2p,
	ipfs: ipfs,
	https: https,
	onion: onion,
	onion3: onion3,
	garlic64: garlic64,
	garlic32: garlic32,
	tls: tls,
	quic: quic,
	ws: ws,
	wss: wss,
	http: http,
	json: json,
	messagepack: messagepack,
	x11: x11,
	'default': baseTable
};

var codecs = getCjsExportFromNamespace(baseTable$1);

// map for hexString -> codecName
const nameTable = new Map();

for (const encodingName in codecs) {
  const code = codecs[encodingName];
  nameTable.set(code, encodingName);
}

var intTable = Object.freeze(nameTable);

const { Buffer: Buffer$2 } = buffer;

var util = {
  numberToBuffer,
  bufferToNumber,
  varintBufferEncode,
  varintBufferDecode,
  varintEncode
};

function bufferToNumber (buf) {
  return parseInt(buf.toString('hex'), 16)
}

function numberToBuffer (num) {
  let hexString = num.toString(16);
  if (hexString.length % 2 === 1) {
    hexString = '0' + hexString;
  }
  return Buffer$2.from(hexString, 'hex')
}

function varintBufferEncode (input) {
  return Buffer$2.from(varint.encode(bufferToNumber(input)))
}

function varintBufferDecode (input) {
  return numberToBuffer(varint.decode(input))
}

function varintEncode (num) {
  return Buffer$2.from(varint.encode(num))
}

const varintEncode$1 = util.varintEncode;

// map for codecName -> codeVarintBuffer
const varintTable = {};

for (const encodingName in codecs) {
  const code = codecs[encodingName];
  varintTable[encodingName] = varintEncode$1(code);
}

var varintTable_1 = Object.freeze(varintTable);

// map for codecConstant -> code
const constants$2 = {};

for (const [name, code] of Object.entries(codecs)) {
  constants$2[name.toUpperCase().replace(/-/g, '_')] = code;
}

var constants_1$1 = Object.freeze(constants$2);

// map for code -> print friendly name
const tableByCode = {};

for (const [name, code] of Object.entries(codecs)) {
  if (tableByCode[code] === undefined) tableByCode[code] = name;
}

var print = Object.freeze(tableByCode);

var src$3 = createCommonjsModule(function (module, exports) {

const { Buffer } = buffer;





exports = module.exports;

/**
 * Prefix a buffer with a multicodec-packed.
 *
 * @param {string|number} multicodecStrOrCode
 * @param {Buffer} data
 * @returns {Buffer}
 */
exports.addPrefix = (multicodecStrOrCode, data) => {
  let prefix;

  if (Buffer.isBuffer(multicodecStrOrCode)) {
    prefix = util.varintBufferEncode(multicodecStrOrCode);
  } else {
    if (varintTable_1[multicodecStrOrCode]) {
      prefix = varintTable_1[multicodecStrOrCode];
    } else {
      throw new Error('multicodec not recognized')
    }
  }
  return Buffer.concat([prefix, data])
};

/**
 * Decapsulate the multicodec-packed prefix from the data.
 *
 * @param {Buffer} data
 * @returns {Buffer}
 */
exports.rmPrefix = (data) => {
  varint.decode(data);
  return data.slice(varint.decode.bytes)
};

/**
 * Get the codec of the prefixed data.
 * @param {Buffer} prefixedData
 * @returns {string}
 */
exports.getCodec = (prefixedData) => {
  const code = varint.decode(prefixedData);
  const codecName = intTable.get(code);
  if (codecName === undefined) {
    throw new Error(`Code ${code} not found`)
  }
  return codecName
};

/**
 * Get the name of the codec.
 * @param {number} codec
 * @returns {string}
 */
exports.getName = (codec) => {
  return intTable.get(codec)
};

/**
 * Get the code of the codec
 * @param {string} name
 * @returns {number}
 */
exports.getNumber = (name) => {
  const code = varintTable_1[name];
  if (code === undefined) {
    throw new Error('Codec `' + name + '` not found')
  }
  return util.varintBufferDecode(code)[0]
};

/**
 * Get the code of the prefixed data.
 * @param {Buffer} prefixedData
 * @returns {number}
 */
exports.getCode = (prefixedData) => {
  return varint.decode(prefixedData)
};

/**
 * Get the code as varint of a codec name.
 * @param {string} codecName
 * @returns {Buffer}
 */
exports.getCodeVarint = (codecName) => {
  const code = varintTable_1[codecName];
  if (code === undefined) {
    throw new Error('Codec `' + codecName + '` not found')
  }
  return code
};

/**
 * Get the varint of a code.
 * @param {Number} code
 * @returns {Array.<number>}
 */
exports.getVarint = (code) => {
  return varint.encode(code)
};

// Make the constants top-level constants

Object.assign(exports, constants_1$1);

// Human friendly names for printing, e.g. in error messages
exports.print = print;
});

const { Buffer: Buffer$3 } = buffer;
var CIDUtil = {
  /**
   * Test if the given input is a valid CID object.
   * Returns an error message if it is not.
   * Returns undefined if it is a valid CID.
   *
   * @param {any} other
   * @returns {string}
   */
  checkCIDComponents: function (other) {
    if (other == null) {
      return 'null values are not valid CIDs'
    }

    if (!(other.version === 0 || other.version === 1)) {
      return 'Invalid version, must be a number equal to 1 or 0'
    }

    if (typeof other.codec !== 'string') {
      return 'codec must be string'
    }

    if (other.version === 0) {
      if (other.codec !== 'dag-pb') {
        return "codec must be 'dag-pb' for CIDv0"
      }
      if (other.multibaseName !== 'base58btc') {
        return "multibaseName must be 'base58btc' for CIDv0"
      }
    }

    if (!Buffer$3.isBuffer(other.multihash)) {
      return 'multihash must be a Buffer'
    }

    try {
      src$2.validate(other.multihash);
    } catch (err) {
      let errorMsg = err.message;
      if (!errorMsg) { // Just in case mh.validate() throws an error with empty error message
        errorMsg = 'Multihash validation failed';
      }
      return errorMsg
    }
  }
};

var cidUtil = CIDUtil;

function withIs(Class, { className, symbolName }) {
    const symbol = Symbol.for(symbolName);

    const ClassIsWrapper = {
        // The code below assigns the class wrapper to an object to trick
        // JavaScript engines to show the name of the extended class when
        // logging an instances.
        // We are assigning an anonymous class (class wrapper) to the object
        // with key `className` to keep the correct name.
        // If this is not supported it falls back to logging `ClassIsWrapper`.
        [className]: class extends Class {
            constructor(...args) {
                super(...args);
                Object.defineProperty(this, symbol, { value: true });
            }

            get [Symbol.toStringTag]() {
                return className;
            }
        },
    }[className];

    ClassIsWrapper[`is${className}`] = (obj) => !!(obj && obj[symbol]);

    return ClassIsWrapper;
}

function withIsProto(Class, { className, symbolName, withoutNew }) {
    const symbol = Symbol.for(symbolName);

    /* eslint-disable object-shorthand */
    const ClassIsWrapper = {
        [className]: function (...args) {
            if (withoutNew && !(this instanceof ClassIsWrapper)) {
                return new ClassIsWrapper(...args);
            }

            const _this = Class.call(this, ...args) || this;

            if (_this && !_this[symbol]) {
                Object.defineProperty(_this, symbol, { value: true });
            }

            return _this;
        },
    }[className];
    /* eslint-enable object-shorthand */

    ClassIsWrapper.prototype = Object.create(Class.prototype);
    ClassIsWrapper.prototype.constructor = ClassIsWrapper;

    Object.defineProperty(ClassIsWrapper.prototype, Symbol.toStringTag, {
        get() {
            return className;
        },
    });

    ClassIsWrapper[`is${className}`] = (obj) => !!(obj && obj[symbol]);

    return ClassIsWrapper;
}

var classIs = withIs;
var proto = withIsProto;
classIs.proto = proto;

const { Buffer: Buffer$4 } = buffer;







/**
 * @typedef {Object} SerializedCID
 * @param {string} codec
 * @param {number} version
 * @param {Buffer} multihash
 */

/**
 * Test if the given input is a CID.
 * @function isCID
 * @memberof CID
 * @static
 * @param {any} other
 * @returns {bool}
 */

/**
 * Class representing a CID `<mbase><version><mcodec><mhash>`
 * , as defined in [ipld/cid](https://github.com/multiformats/cid).
 * @class CID
 */
class CID {
  /**
   * Create a new CID.
   *
   * The algorithm for argument input is roughly:
   * ```
   * if (cid)
   *   -> create a copy
   * else if (str)
   *   if (1st char is on multibase table) -> CID String
   *   else -> bs58 encoded multihash
   * else if (Buffer)
   *   if (1st byte is 0 or 1) -> CID
   *   else -> multihash
   * else if (Number)
   *   -> construct CID by parts
   * ```
   *
   * @param {string|Buffer|CID} version
   * @param {string} [codec]
   * @param {Buffer} [multihash]
   * @param {string} [multibaseName]
   *
   * @example
   * new CID(<version>, <codec>, <multihash>, <multibaseName>)
   * new CID(<cidStr>)
   * new CID(<cid.buffer>)
   * new CID(<multihash>)
   * new CID(<bs58 encoded multihash>)
   * new CID(<cid>)
   */
  constructor (version, codec, multihash, multibaseName) {
    if (_CID.isCID(version)) {
      // version is an exising CID instance
      const cid = version;
      this.version = cid.version;
      this.codec = cid.codec;
      this.multihash = Buffer$4.from(cid.multihash);
      // Default guard for when a CID < 0.7 is passed with no multibaseName
      this.multibaseName = cid.multibaseName || (cid.version === 0 ? 'base58btc' : 'base32');
      return
    }

    if (typeof version === 'string') {
      // e.g. 'base32' or false
      const baseName = src$1.isEncoded(version);
      if (baseName) {
        // version is a CID String encoded with multibase, so v1
        const cid = src$1.decode(version);
        this.version = parseInt(cid.slice(0, 1).toString('hex'), 16);
        this.codec = src$3.getCodec(cid.slice(1));
        this.multihash = src$3.rmPrefix(cid.slice(1));
        this.multibaseName = baseName;
      } else {
        // version is a base58btc string multihash, so v0
        this.version = 0;
        this.codec = 'dag-pb';
        this.multihash = src$2.fromB58String(version);
        this.multibaseName = 'base58btc';
      }
      CID.validateCID(this);
      Object.defineProperty(this, 'string', { value: version });
      return
    }

    if (Buffer$4.isBuffer(version)) {
      const firstByte = version.slice(0, 1);
      const v = parseInt(firstByte.toString('hex'), 16);
      if (v === 1) {
        // version is a CID buffer
        const cid = version;
        this.version = v;
        this.codec = src$3.getCodec(cid.slice(1));
        this.multihash = src$3.rmPrefix(cid.slice(1));
        this.multibaseName = 'base32';
      } else {
        // version is a raw multihash buffer, so v0
        this.version = 0;
        this.codec = 'dag-pb';
        this.multihash = version;
        this.multibaseName = 'base58btc';
      }
      CID.validateCID(this);
      return
    }

    // otherwise, assemble the CID from the parameters

    /**
     * @type {number}
     */
    this.version = version;

    /**
     * @type {string}
     */
    this.codec = codec;

    /**
     * @type {Buffer}
     */
    this.multihash = multihash;

    /**
     * @type {string}
     */
    this.multibaseName = multibaseName || (version === 0 ? 'base58btc' : 'base32');

    CID.validateCID(this);
  }

  /**
   * The CID as a `Buffer`
   *
   * @return {Buffer}
   * @readonly
   *
   * @memberOf CID
   */
  get buffer () {
    let buffer = this._buffer;

    if (!buffer) {
      if (this.version === 0) {
        buffer = this.multihash;
      } else if (this.version === 1) {
        buffer = Buffer$4.concat([
          Buffer$4.from('01', 'hex'),
          src$3.getCodeVarint(this.codec),
          this.multihash
        ]);
      } else {
        throw new Error('unsupported version')
      }

      // Cache this buffer so it doesn't have to be recreated
      Object.defineProperty(this, '_buffer', { value: buffer });
    }

    return buffer
  }

  /**
   * Get the prefix of the CID.
   *
   * @returns {Buffer}
   * @readonly
   */
  get prefix () {
    return Buffer$4.concat([
      Buffer$4.from(`0${this.version}`, 'hex'),
      src$3.getCodeVarint(this.codec),
      src$2.prefix(this.multihash)
    ])
  }

  /**
   * Convert to a CID of version `0`.
   *
   * @returns {CID}
   */
  toV0 () {
    if (this.codec !== 'dag-pb') {
      throw new Error('Cannot convert a non dag-pb CID to CIDv0')
    }

    const { name, length } = src$2.decode(this.multihash);

    if (name !== 'sha2-256') {
      throw new Error('Cannot convert non sha2-256 multihash CID to CIDv0')
    }

    if (length !== 32) {
      throw new Error('Cannot convert non 32 byte multihash CID to CIDv0')
    }

    return new _CID(0, this.codec, this.multihash)
  }

  /**
   * Convert to a CID of version `1`.
   *
   * @returns {CID}
   */
  toV1 () {
    return new _CID(1, this.codec, this.multihash)
  }

  /**
   * Encode the CID into a string.
   *
   * @param {string} [base=this.multibaseName] - Base encoding to use.
   * @returns {string}
   */
  toBaseEncodedString (base = this.multibaseName) {
    if (this.string && base === this.multibaseName) {
      return this.string
    }
    let str = null;
    if (this.version === 0) {
      if (base !== 'base58btc') {
        throw new Error('not supported with CIDv0, to support different bases, please migrate the instance do CIDv1, you can do that through cid.toV1()')
      }
      str = src$2.toB58String(this.multihash);
    } else if (this.version === 1) {
      str = src$1.encode(base, this.buffer).toString();
    } else {
      throw new Error('unsupported version')
    }
    if (base === this.multibaseName) {
      // cache the string value
      Object.defineProperty(this, 'string', { value: str });
    }
    return str
  }

  /**
   * CID(QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n)
   *
   * @returns {String}
   */
  [Symbol.for('nodejs.util.inspect.custom')] () {
    return 'CID(' + this.toString() + ')'
  }

  toString (base) {
    return this.toBaseEncodedString(base)
  }

  /**
   * Serialize to a plain object.
   *
   * @returns {SerializedCID}
   */
  toJSON () {
    return {
      codec: this.codec,
      version: this.version,
      hash: this.multihash
    }
  }

  /**
   * Compare equality with another CID.
   *
   * @param {CID} other
   * @returns {bool}
   */
  equals (other) {
    return this.codec === other.codec &&
      this.version === other.version &&
      this.multihash.equals(other.multihash)
  }

  /**
   * Test if the given input is a valid CID object.
   * Throws if it is not.
   *
   * @param {any} other
   * @returns {void}
   */
  static validateCID (other) {
    const errorMsg = cidUtil.checkCIDComponents(other);
    if (errorMsg) {
      throw new Error(errorMsg)
    }
  }
}

const _CID = classIs(CID, {
  className: 'CID',
  symbolName: '@ipld/js-cid/CID'
});

_CID.codecs = codecs;

var src$4 = _CID;

var resolveIpfs = function resolveIpfs(ipfsURI) {
  if (ipfsURI.indexOf("ipfs://") >= 0) {
    var comps = ipfsURI.split("ipfs://");
    var uri = comps[1];

    if (uri.indexOf("ipfs/") >= 0) {
      return "https://cloudflare-ipfs.com/" + uri;
    } else {
      return "https://" + new src$4(uri).toV1().toString() + ".ipfs.cf-ipfs.com";
    }
  } else {
    return ipfsURI;
  }
};

var felt_to_str = function felt_to_str(input) {
  var parsed = input;
  if (input.indexOf('0x') === 0) parsed = input.split('0x')[1];
  var output = "";

  if (parsed.length % 2 === 1) {
    parsed = "0" + parsed;
  }

  for (var i = 0; i < parsed.length; i += 2) {
    var curr = parsed.slice(i, i + 2);
    var num = BigNumber.from("0x" + curr);
    output += String.fromCharCode(num.toNumber());
  }

  return output;
};

var loadL2AppData = function loadL2AppData(params) {
  return new Promise(function (resolve, reject) {
    try {
      var _temp7 = function () {
        if (params.swo) {
          var tAppData = [];

          var _temp8 = _finallyRethrows(function () {
            return _catch(function () {
              var _params$swo$provider;

              return Promise.resolve((_params$swo$provider = params.swo.provider) === null || _params$swo$provider === void 0 ? void 0 : _params$swo$provider.callContract({
                contractAddress: params.starknetConfiguration.address,
                entrypoint: "get_app_len",
                calldata: [ethers.BigNumber.from(params.address).toString()]
              })).then(function (getAppLenResult) {
                function _temp4() {
                  resolve(tAppData);
                }

                var numberOfApps = ethers.BigNumber.from(getAppLenResult.result[0]).toNumber();
                var i = 0;

                var _temp3 = _for(function () {
                  return i < numberOfApps;
                }, function () {
                  return i++;
                }, function () {
                  var _params$swo$provider2;

                  return Promise.resolve((_params$swo$provider2 = params.swo.provider) === null || _params$swo$provider2 === void 0 ? void 0 : _params$swo$provider2.callContract({
                    contractAddress: params.starknetConfiguration.address,
                    entrypoint: "get_app_array",
                    calldata: [ethers.BigNumber.from(params.address).toString(), "" + i]
                  })).then(function (getAppArrayDataByIndexResult) {
                    var _params$swo$provider3;

                    var appIdAtIndex = ethers.BigNumber.from(getAppArrayDataByIndexResult.result[0]).toNumber();
                    return Promise.resolve((_params$swo$provider3 = params.swo.provider) === null || _params$swo$provider3 === void 0 ? void 0 : _params$swo$provider3.callContract({
                      contractAddress: params.starknetConfiguration.address,
                      entrypoint: "get_app_installation",
                      calldata: [ethers.BigNumber.from(params.address).toString(), "" + i]
                    })).then(function (isInstalledResult) {
                      var _params$swo$provider4;

                      var isInstalled = ethers.BigNumber.from(isInstalledResult.result[0]).toNumber() === 1;

                      if (!isInstalled) {
                        return;
                      }

                      return Promise.resolve((_params$swo$provider4 = params.swo.provider) === null || _params$swo$provider4 === void 0 ? void 0 : _params$swo$provider4.callContract({
                        contractAddress: params.starknetConfiguration.address,
                        entrypoint: "get_app_param_count",
                        calldata: [ethers.BigNumber.from(params.address).toString(), "" + i]
                      })).then(function (appParamCountResult) {
                        function _temp2() {
                          return Promise.resolve(fetchAppDetailById(appIdAtIndex, params)).then(function (l1AppData) {
                            tAppData.push({
                              AppId: appIdAtIndex,
                              AppIndex: i,
                              Params: configuredAppParams,
                              Status: 'ACCEPTED',
                              IsInstalled: ethers.BigNumber.from(isInstalledResult.result[0]).toNumber() === 1,
                              ByoaApp: l1AppData
                            });
                          });
                        }

                        var configuredAppParams = [];
                        var j = 0;

                        var _temp = _for(function () {
                          return j < ethers.BigNumber.from(appParamCountResult.result[0]).toNumber();
                        }, function () {
                          return j++;
                        }, function () {
                          var _params$swo$provider5;

                          return Promise.resolve((_params$swo$provider5 = params.swo.provider) === null || _params$swo$provider5 === void 0 ? void 0 : _params$swo$provider5.callContract({
                            contractAddress: params.starknetConfiguration.address,
                            entrypoint: "get_app_param_value_array",
                            calldata: [ethers.BigNumber.from(params.address).toString(), "" + i, "" + j]
                          })).then(function (appParamValuesByIndexResult) {
                            configuredAppParams.push({
                              ID: felt_to_str(appParamValuesByIndexResult.result[0]),
                              Value: felt_to_str(appParamValuesByIndexResult.result[1])
                            });
                          });
                        });

                        return _temp && _temp.then ? _temp.then(_temp2) : _temp2(_temp);
                      });
                    });
                  });
                });

                return _temp3 && _temp3.then ? _temp3.then(_temp4) : _temp4(_temp3);
              });
            }, function (error) {
              reject(error);
            });
          }, function (_wasThrown, _result) {
            if (_wasThrown) throw _result;
            return _result;
          });

          if (_temp8 && _temp8.then) return _temp8.then(function () {});
        } else {
          resolve([]);
        }
      }();

      return Promise.resolve(_temp7 && _temp7.then ? _temp7.then(function () {}) : void 0);
    } catch (e) {
      return Promise.reject(e);
    }
  });
};

var fetchAppDetailById = function fetchAppDetailById(appId, params) {
  try {
    return Promise.resolve(new Promise(function (resolve, reject) {
      try {
        var w3 = new Web3(params.alchemyConfiguration.url);

        var _temp10 = _finallyRethrows(function () {
          return _catch(function () {
            var contract = new w3.eth.Contract(abi$1.abi, params.byoaContractDetails.address);
            return Promise.resolve(contract.methods.getAppDetailsById(appId).call()).then(function (appDetails) {
              var app = {
                id: appId,
                name: appDetails[0],
                description: appDetails[1],
                tokenURI: appDetails[2],
                owner: appDetails[3],
                price: parseInt(appDetails[4]),
                address: params.byoaContractDetails.address,
                version: 'beta v0.1'
              };
              resolve(app);
            });
          }, function (error) {
            console.log("Error fetching apps: " + error);
            reject(error);
          });
        }, function (_wasThrown2, _result2) {
          if (_wasThrown2) throw _result2;
          return _result2;
        });

        return Promise.resolve(_temp10 && _temp10.then ? _temp10.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    }));
  } catch (e) {
    return Promise.reject(e);
  }
};

var default_byoaContractAddress = "0x8f15c4ea6ce3fbfc5f7402c5766fc94202704161";
var default_providerNetwork = "https://eth-mainnet.alchemyapi.io/v2/Uo717K-DDAxlSM5gXM-zgv678k0aMZH5";
var default_jrpcProvider = new ethers.providers.JsonRpcProvider('https://eth-mainnet.alchemyapi.io/v2/Uo717K-DDAxlSM5gXM-zgv678k0aMZH5', 'mainnet');
var default_infuraId = "6430aa46e9354b91bea44e464af71f7a";
var default_starknetAddress = "0x071a48d5b8c9ffdd91fd21af1a12816fe420e731e6a776a30214bdc741dc10c4";
var default_starknetNetwork = 'mainnet';
window.byoa = {
  context: {
    target: {
      hud: "byoa-hud"
    },
    ethers: ethers,
    provider: ethers.getDefaultProvider(default_providerNetwork),
    jrpcProvider: default_jrpcProvider,
    addDataListener: function addDataListener(cb) {
    },
    account: {
      address: null
    }
  }
};
var useStyles = makeStyles({
  root: {
    position: 'fixed',
    top: 0,
    left: 0,
    minWidth: '100vw',
    minHeight: '100vh',
    background: 'rgba(50,0,0,0.00)',
    pointerEvents: 'none'
  },
  root_highZ: {
    position: 'fixed',
    top: 0,
    left: 0,
    minWidth: '100vw',
    minHeight: '100vh',
    background: 'rgba(50,0,0,0.00)',
    pointerEvents: 'none',
    zIndex: 1000000000
  },
  speedDial: {
    position: 'fixed',
    bottom: 20,
    right: 20,
    zIndex: 1000000000
  },
  byoaButton: {
    textTransform: 'none'
  }
});
var singletonByoaAppContainerId = "byoa-singleton-container";

function getSingletonByoaAppContainer() {
  var j = document.getElementById(singletonByoaAppContainerId);
  if (j !== null) return j;
  var e = document.createElement("div");
  e.setAttribute("id", singletonByoaAppContainerId);
  e.style.position = 'absolute';
  e.style.right = '1vw';
  e.style.bottom = '1vh';
  e.style.width = '24.1vw';
  e.style.height = '38.2vh';
  document.body.appendChild(e);
  return e;
}

function toggleSingletonViewSize(size) {
  var e = document.getElementById(singletonByoaAppContainerId);
  if (e === null) return;

  switch (size) {
    case 'small':
      e.style.width = '24.1vw';
      e.style.height = '38.2vh';
      break;

    case 'large':
      e.style.width = '100vw';
      e.style.height = '100vh';
      break;
  }
}

var singletonByoaAppIframeId = "byoa-singleton-iframe";

function makeOrUpdateSingletonByoaAppIframe(container, src) {
  var j = document.getElementById(singletonByoaAppIframeId);

  if (j === null) {
    var e = document.createElement("iframe");
    e.setAttribute("id", singletonByoaAppIframeId);
    e.setAttribute("src", src);
    e.style.width = '100%';
    e.style.height = '100%';
    container.appendChild(e);
  } else {
    j.setAttribute("src", src);
    container.appendChild(j);
  }
}

var ByoaSDK = function ByoaSDK(props) {
  var _props$alchemyConfigu, _props$byoaContractDe, _props$starknetConfig, _props$starknetConfig2, _props$infuraConfigur, _props$alchemyConfigu2;

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

  var _React$useState4 = useState(null),
      provider = _React$useState4[0],
      setProvider = _React$useState4[1];

  var _React$useState5 = useState((_props$alchemyConfigu = props.alchemyConfiguration) === null || _props$alchemyConfigu === void 0 ? void 0 : _props$alchemyConfigu.url),
      providerNetwork = _React$useState5[0],
      setProviderNetwork = _React$useState5[1];

  var _React$useState6 = useState(null),
      web3 = _React$useState6[0],
      setWeb3 = _React$useState6[1];

  var _React$useState7 = useState(null),
      accountAddress = _React$useState7[0],
      setAccountAddress = _React$useState7[1];

  var _React$useState8 = useState(undefined),
      argentAddress = _React$useState8[0],
      setArgentAddress = _React$useState8[1];

  var _React$useState9 = useState(false),
      isArgentConnected = _React$useState9[0],
      setIsArgentConnected = _React$useState9[1];

  var _React$useState10 = useState(false),
      isConnectingArgent = _React$useState10[0],
      setIsConnectingArgent = _React$useState10[1];

  var _React$useState11 = useState(false),
      appIsRunning = _React$useState11[0],
      setAppIsRunning = _React$useState11[1];

  var _React$useState12 = useState(""),
      runningAppId = _React$useState12[0],
      setRunningAppId = _React$useState12[1];

  var _React$useState13 = useState((_props$byoaContractDe = props.byoaContractDetails) === null || _props$byoaContractDe === void 0 ? void 0 : _props$byoaContractDe.address),
      byoaContractAddress = _React$useState13[0],
      setByoaContractAddress = _React$useState13[1];

  var _React$useState14 = useState((_props$starknetConfig = props.starknetConfiguration) === null || _props$starknetConfig === void 0 ? void 0 : _props$starknetConfig.address),
      starknetAddress = _React$useState14[0],
      setStarknetAddress = _React$useState14[1];

  var _React$useState15 = useState((_props$starknetConfig2 = props.starknetConfiguration) === null || _props$starknetConfig2 === void 0 ? void 0 : _props$starknetConfig2.network),
      starknetNetwork = _React$useState15[0],
      setStarknetNetwork = _React$useState15[1];

  var _React$useState16 = useState(true),
      toggleExpandedView = _React$useState16[0],
      setToggleExpandedView = _React$useState16[1];

  var _React$useState17 = useState(false),
      viewIsExpanded = _React$useState17[0],
      setViewIsExpanded = _React$useState17[1];

  var _React$useState18 = useState([]),
      installedApps = _React$useState18[0],
      setInstalledApps = _React$useState18[1];

  var _React$useState19 = useState(undefined),
      swo = _React$useState19[0],
      setSWO = _React$useState19[1];

  var providerOptions = {
    walletconnect: {
      display: {
        name: "Mobile"
      },
      "package": WalletConnectProvider,
      options: {
        infuraId: (_props$infuraConfigur = props.infuraConfiguration) !== null && _props$infuraConfigur !== void 0 && _props$infuraConfigur.id ? props.infuraConfiguration.id : default_infuraId
      }
    }
  };
  var web3Modal = new Web3Modal({
    network: (_props$alchemyConfigu2 = props.alchemyConfiguration) !== null && _props$alchemyConfigu2 !== void 0 && _props$alchemyConfigu2.url ? props.alchemyConfiguration.url : default_providerNetwork,
    cacheProvider: true,
    disableInjectedProvider: false,
    providerOptions: providerOptions
  });
  useEffect(function () {
    var _props$alchemyConfigu3;

    if ((_props$alchemyConfigu3 = props.alchemyConfiguration) !== null && _props$alchemyConfigu3 !== void 0 && _props$alchemyConfigu3.url) {
      setProviderNetwork(props.alchemyConfiguration.url);
    } else {
      setProviderNetwork(default_providerNetwork);
    }

    if (props.byoaContractDetails) {
      if (props.byoaContractDetails.address) {
        setByoaContractAddress(props.byoaContractDetails.address);
      } else {
        setByoaContractAddress(default_byoaContractAddress);
      }
    } else {
      setByoaContractAddress(default_byoaContractAddress);
    }

    if (props.starknetConfiguration) {
      if (props.starknetConfiguration.address) {
        setStarknetAddress(props.starknetConfiguration.address);
      } else {
        setStarknetAddress(default_starknetAddress);
      }

      if (props.starknetConfiguration.network) {
        setStarknetNetwork(props.starknetConfiguration.network);
      } else {
        setStarknetNetwork(default_starknetNetwork);
      }
    } else {
      setStarknetAddress(default_starknetAddress);
      setStarknetNetwork(default_starknetNetwork);
    }

    if (props.toggleExpandedView) {
      setToggleExpandedView(props.toggleExpandedView);
    }
  }, []);
  useEffect(function () {
    if (swo === undefined) return;
    setIsConnectingArgent(true);
    loadL2AppData({
      swo: swo,
      address: argentAddress,
      byoaContractDetails: {
        address: byoaContractAddress
      },
      alchemyConfiguration: {
        url: providerNetwork
      },
      starknetConfiguration: {
        address: starknetAddress,
        network: starknetNetwork
      }
    }).then(function (data) {
      installL2AppsForUse(data);
    })["catch"](function (error) {
      alert("Error loading l2 " + error);
    })["finally"](function () {
      setIsConnectingArgent(false);
    });
  }, [isArgentConnected]);
  useState(function () {
    if (swo === undefined) return;

    if (swo.isConnected != isArgentConnected) {
      setIsArgentConnected(swo === null || swo === void 0 ? void 0 : swo.isConnected);
    }
  }, [swo === null || swo === void 0 ? void 0 : swo.isConnected]);

  var connectArgentWallet = function connectArgentWallet() {
    try {
      var _temp2 = _catch(function () {
        var starknet = getStarknet();
        setSWO(starknet);
        return Promise.resolve(starknet.enable()).then(function (_ref) {
          var userWalletContractAddress = _ref[0];

          if (userWalletContractAddress.length > 0) {
            setArgentAddress(userWalletContractAddress);
            setIsArgentConnected(starknet.isConnected);
          }
        });
      }, function (error) {
        console.log("Got Starknet Error: ", error);
      });

      return Promise.resolve(_temp2 && _temp2.then ? _temp2.then(function () {}) : void 0);
    } catch (e) {
      return Promise.reject(e);
    }
  };

  var connectWallet = function connectWallet() {
    try {
      var _exit2 = false;
      return Promise.resolve(_catch(function () {
        function _temp4(_result) {
          if (_exit2) return _result;
          var w3 = web3;

          if (w3 === null) {
            w3 = new Web3(p);

            if (w3 === null) {
              throw new Error('Unable to connect web3');
            }

            setWeb3(w3);
          }

          return Promise.resolve(p.request({
            method: 'eth_accounts'
          })).then(function (accounts) {
            if (accounts.length > 0) {
              setAccountAddress(accounts[0]);
              setTimeout(function () {
                try {
                  refreshMyApps(accounts[0]);
                  return Promise.resolve();
                } catch (e) {
                  return Promise.reject(e);
                }
              }, 2000);
            }
          });
        }

        var p = provider;

        var _temp3 = function () {
          if (p === null) {
            return Promise.resolve(web3Modal.connect()).then(function (_web3Modal$connect) {
              p = _web3Modal$connect;

              if (p === null) {
                throw new Error('Unable to connect provider to modal');
              }

              p.on('accountsChanged', function (e) {
                disconnectWallet();
              });
              setProvider(p);
            });
          }
        }();

        return _temp3 && _temp3.then ? _temp3.then(_temp4) : _temp4(_temp3);
      }, function (error) {
        console.log(error);
        alert('Unable to connect wallet. Please try again.');
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  var disconnectWallet = function disconnectWallet() {
    try {
      return Promise.resolve(web3Modal.clearCachedProvider()).then(function () {
        setProvider(null);
        setAccountAddress(null);
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  var getTokenMetadata = function getTokenMetadata(uri) {
    try {
      return Promise.resolve(fetch(resolveIpfs(uri))).then(function (d) {
        return Promise.resolve(d.json());
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  var installL2AppsForUse = function installL2AppsForUse(l2Apps) {
    try {
      var _temp9 = function _temp9() {
        setInstalledApps(allInstalls);
      };

      var allInstalls = [];

      var _temp10 = _forTo(l2Apps, function (i) {
        function _temp6() {
          var ia = {
            id: l2App.AppId,
            tokenURI: l2App.ByoaApp.tokenURI,
            app: l2App.ByoaApp,
            imageURI: tokenMeta.image,
            byoaDetails: {
              uri: tokenMeta.implementationURIs.browser,
              target: 'iframe'
            }
          };
          allInstalls.push(ia);
        }

        var l2App = l2Apps[i];
        var tokenMeta = {};

        var _temp5 = _catch(function () {
          return Promise.resolve(getTokenMetadata(l2App.ByoaApp.tokenURI)).then(function (_getTokenMetadata) {
            tokenMeta = _getTokenMetadata;
          });
        }, function () {});

        return _temp5 && _temp5.then ? _temp5.then(_temp6) : _temp6(_temp5);
      });

      return Promise.resolve(_temp10 && _temp10.then ? _temp10.then(_temp9) : _temp9(_temp10));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  var refreshMyApps = function refreshMyApps(addressHelper) {
    try {
      var w3 = new Web3(providerNetwork);

      var _temp18 = _catch(function () {
        var contract = new w3.eth.Contract(abi$1.abi, byoaContractAddress);
        return Promise.resolve(contract.methods.walletOfOwner(accountAddress ? accountAddress : addressHelper).call()).then(function (myTokenIds) {
          function _temp16() {
            setInstalledApps(allInstalls);
          }

          var appLUT = {};
          var allInstalls = [];

          var _temp15 = _forTo(myTokenIds, function (i) {
            var tid = parseInt(myTokenIds[i]);
            return Promise.resolve(contract.methods.getAppIdByTokenId(tid).call()).then(function (appIdForToken) {
              return Promise.resolve(contract.methods.tokenURI(tid).call()).then(function (directTokenURI) {
                function _temp14() {
                  function _temp12() {
                    var ia = {
                      id: tid,
                      tokenURI: directTokenURI,
                      app: appLUT[appIdForToken],
                      imageURI: tokenMeta.image,
                      byoaDetails: {
                        uri: tokenMeta.implementationURIs.browser,
                        target: 'iframe'
                      }
                    };
                    allInstalls.push(ia);
                  }

                  if (tokenMeta === null) return;

                  var _temp11 = function () {
                    if (appLUT[appIdForToken] !== null) {
                      return Promise.resolve(contract.methods.getAppDetailsById(parseInt(appIdForToken)).call()).then(function (appDetails) {
                        appLUT[appIdForToken] = {
                          id: appIdForToken,
                          name: appDetails[0],
                          description: appDetails[1],
                          tokenURI: appDetails[2],
                          owner: appDetails[3],
                          price: parseInt(appDetails[4]),
                          address: byoaContractAddress,
                          version: tokenMeta.version
                        };
                      });
                    }
                  }();

                  return _temp11 && _temp11.then ? _temp11.then(_temp12) : _temp12(_temp11);
                }

                var tokenMeta = null;

                var _temp13 = _catch(function () {
                  return Promise.resolve(getTokenMetadata(directTokenURI)).then(function (_getTokenMetadata2) {
                    tokenMeta = _getTokenMetadata2;
                  });
                }, function (e) {
                  console.warn("error fetching byoa app metadata, skipping this app. Tokenid", tid, "tokenUri", directTokenURI, "error", e);
                });

                return _temp13 && _temp13.then ? _temp13.then(_temp14) : _temp14(_temp13);
              });
            });
          });

          return _temp15 && _temp15.then ? _temp15.then(_temp16) : _temp16(_temp15);
        });
      }, function (error) {
        console.log("Error fetching apps: " + error);
      });

      return Promise.resolve(_temp18 && _temp18.then ? _temp18.then(function () {}) : void 0);
    } catch (e) {
      return Promise.reject(e);
    }
  };

  return createElement(Box, {
    className: toggleExpandedView ? classes.root_highZ : classes.root,
    id: "byoa-hud"
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
    icon: createElement(Box, null, isConnectingArgent && createElement(CircularProgress, {
      color: "secondary"
    }), !isConnectingArgent && createElement(MenuIcon, null)),
    open: openDial,
    onOpen: function onOpen() {
      setOpenDial(true);
    },
    onClose: function onClose() {
      setOpenDial(false);
    },
    onClick: function onClick() {},
    direction: dialDirection
  }, props.mode === "l1" && createElement(SpeedDialAction, {
    key: 'sda-connect-wallet',
    icon: createElement(AccountBalanceWalletIcon, null),
    tooltipTitle: 'Connect Wallet',
    onClick: function onClick() {
      connectWallet();
    }
  }), (props.mode === "l2" || props.mode === undefined) && createElement(SpeedDialAction, {
    key: 'sda-connect-wallet-argent',
    icon: createElement(AccountBalanceWalletIcon, null),
    tooltipTitle: isConnectingArgent ? 'Connecting...' : isArgentConnected ? 'Connected' : 'Connect Argent',
    onClick: function onClick() {
      if (isConnectingArgent) return;

      if (isArgentConnected === false || swo === undefined) {
        connectArgentWallet();
      } else {
        alert("Argent Wallet is already connected");
      }
    }
  }), installedApps.map(function (installedApp, i) {
    return createElement(SpeedDialAction, {
      key: "sd-action-" + installedApp.id + "-" + i,
      icon: createElement("img", {
        style: {
          width: '40px',
          height: '40px'
        },
        src: resolveIpfs(installedApp.imageURI)
      }),
      tooltipTitle: installedApp.app.name + " " + installedApp.app.version + (runningAppId === "" + installedApp.app.id ? '(running)' : ''),
      onClick: function onClick() {
        if (appIsRunning) {
          if (runningAppId !== "" + installedApp.app.id) {
            alert("Only one app may be run at a time currently.");
            return;
          }

          if (toggleExpandedView) {
            toggleSingletonViewSize(viewIsExpanded ? 'small' : 'large');
            setViewIsExpanded(!viewIsExpanded);
          } else {
            alert("Only one app may be run at a time currently.");
          }

          return;
        }

        if (installedApp.byoaDetails.target === "iframe") {
          var c = getSingletonByoaAppContainer();
          makeOrUpdateSingletonByoaAppIframe(c, resolveIpfs(installedApp.byoaDetails.uri));
          setAppIsRunning(true);
          setRunningAppId("" + installedApp.app.id);
        }
      }
    });
  })))));
};

export { ByoaSDK };
//# sourceMappingURL=index.modern.js.map
