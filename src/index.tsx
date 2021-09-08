import { Box, Container, makeStyles, Typography } from '@material-ui/core';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import { SpeedDial, SpeedDialAction } from '@material-ui/lab';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { ethers } from 'ethers';
import * as React from 'react';
import Web3 from 'web3';
import Web3Modal from "web3modal";
import DragMove from './components/DragMove';
import { InstalledApp } from './types/installedApp';
import abi from './utils/abi/Byoa.json';
import { resolveIpfs } from './utils/ipfs_resolver';

interface Props {
  dataPipe?: {
    data: any
  }
}

const byoaContractAddress = `0xD3CFd6dDd98b8245C849D0f845ddC0b6Ce2E01e3`;
const providerNetwork = `https://eth-ropsten.alchemyapi.io/v2/Uo717K-DDAxlSM5gXM-zgv678k0aMZH5`;
const jrpcProvider = new ethers.providers.JsonRpcProvider('https://eth-mainnet.alchemyapi.io/v2/Uo717K-DDAxlSM5gXM-zgv678k0aMZH5', 'mainnet');

let listeners: any = [];
// @ts-expect-error
window.byoa = {
  context: {
    target: {
      hud: "byoa-hud"
    },
    ethers: ethers,
    provider: ethers.getDefaultProvider('https://eth-mainnet.alchemyapi.io/v2/Uo717K-DDAxlSM5gXM-zgv678k0aMZH5'),
    jrpcProvider: jrpcProvider,
    addDataListener: (cb: any) => {
      listeners.push(cb);
    },
    account: {
      address: null
    }
  }
};

const useStyles = makeStyles({
  root: {
    position: 'fixed',
    top: 0,
    left: 0,
    minWidth: '100vw',
    minHeight: '100vh',
    background: 'rgba(50,0,0,0.00)',
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

const providerOptions = {
  walletconnect: {
    display: {
      name: "Mobile"
    },
    package: WalletConnectProvider,
    options: {
      infuraId: "6430aa46e9354b91bea44e464af71f7a" // required
    }
  }
};

const web3Modal = new Web3Modal({
  network: providerNetwork, // optional
  cacheProvider: true, // optional
  disableInjectedProvider: false,
  providerOptions // required
});

const singletonByoaAppContainerId = "byoa-singleton-container";
// postcondition: byoa app singleton container has been created and is appended to document body
function getSingletonByoaAppContainer(): HTMLElement {
  const j = document.getElementById(singletonByoaAppContainerId);
  if (j !== null) return j;
  const e = document.createElement("div");
  e.setAttribute("id", singletonByoaAppContainerId);
  e.style.position = 'absolute';
  e.style.right = '1vw';
  e.style.bottom = '1vh';
  e.style.width = '24.1vw';
  e.style.height = '38.2vh';
  document.body.appendChild(e);
  return e;
}

const singletonByoaAppIframeId = "byoa-singleton-iframe";
// postcondition: byoa app singleton iframe has been created, is a child of the passed container, and iframe src has been updated to passed src.
function makeOrUpdateSingletonByoaAppIframe(container: HTMLElement, src: string): void {
  const j = document.getElementById(singletonByoaAppIframeId);
  if (j === null) {
    const e = document.createElement("iframe");
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

export const ByoaSDK = (props: Props) => {
  const classes = useStyles();
  const [translateDial, setTranslateDial] = React.useState({
    x: 0,
    y: 0
  });
  const [dialDirection, setDialDirection] = React.useState<"left" | "right" | "up" | "down" | undefined>("up");
  const [openDial, setOpenDial] = React.useState(false);
  const [provider, setProvider] = React.useState<any>(null);
  const [web3, setWeb3] = React.useState<any>(null);
  const [accountAddress, setAccountAddress] = React.useState<String | null>(null);

  const [installedApps, setInstalledApps] = React.useState<InstalledApp[]>([]);


  const connectWallet = async () => {
    try {
      let p = provider;
      if (p === null) {
        p = await web3Modal.connect();
        if (p === null) {
          throw new Error('Unable to connect provider to modal');
        }
        p.on('accountsChanged', (e: any) => {
          console.log(e);
          disconnectWallet();
        });
        p.on("chainChanged", (chainId: number) => {
          console.log("chain " + chainId);
        });
        setProvider(p);
      }

      let w3 = web3;
      if (w3 === null) {
        w3 = new Web3(p);
        if (w3 === null) {
          throw new Error('Unable to connect web3');
        }
        setWeb3(w3);
      }

      const accounts = await p.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setAccountAddress(accounts[0]);
        setTimeout(async () => {
          refreshMyApps(accounts[0]);
        }, 2000);
      }
    } catch (error) {
      console.log(error);
      alert('Unable to connect wallet. Please try again.');
    }
  };

  const disconnectWallet = async () => {
    await web3Modal.clearCachedProvider();
    setProvider(null);
    setAccountAddress(null);
  };

  // TODO add ByoaAppMetadata type and parse this json into that type
  const getTokenMetadata = async (uri: string): Promise<any> => {
    const d = await fetch(resolveIpfs(uri));
    const json = await d.json();
    return json;
  };

  const refreshMyApps = async (addressHelper: String | undefined | null) => {
    let w3 = new Web3(providerNetwork);
    try {
      // @ts-expect-error
      let contract = new w3.eth.Contract(abi.abi, byoaContractAddress);

      let myTokenIds = await contract.methods.walletOfOwner(accountAddress ? accountAddress : addressHelper).call();
      // console.log(myTokenIds);

      let appLUT: any = {};


      let allInstalls: InstalledApp[] = [];
      for (var i = 0; i < myTokenIds.length; i++) {
        let tid = parseInt(myTokenIds[i]);
        let appIdForToken = await contract.methods.getAppIdByTokenId(tid).call();
        let directTokenURI = await contract.methods.tokenURI(tid).call();
        let tokenMeta: any = null;
        try {
          tokenMeta = await getTokenMetadata(directTokenURI);
        } catch(e) {
          console.warn("error fetching byoa app metadata, skipping this app. Tokenid", tid, "tokenUri", directTokenURI, "error", e);
          continue;
        }

        console.log("got tokenMeta", tokenMeta);

        if (appLUT[appIdForToken] !== null) {
          let appDetails = await contract.methods.getAppDetailsById(parseInt(appIdForToken)).call();
          appLUT[appIdForToken] =
          {
            id: appIdForToken,
            name: appDetails[0],
            description: appDetails[1],
            tokenURI: appDetails[2],
            owner: appDetails[3],
            price: parseInt(appDetails[4]),
            address: byoaContractAddress,
            version: tokenMeta.version,
          }
        }

        let ia: InstalledApp = {
          id: tid,
          tokenURI: directTokenURI,
          app: appLUT[appIdForToken],
          imageURI: tokenMeta.image,
          byoaDetails: {
            uri: tokenMeta.implementationURIs.browser,
            target: 'iframe', // currently, byoa SDK only supports iframe apps. We are designing our strategy for plugins in the host app main javascript thread
          }
        }
        allInstalls.push(ia);
      }
      // console.log(allInstalls)
      setInstalledApps(allInstalls);

    } catch (error) {
      console.log(`Error fetching apps: ${error}`);
    }
  };

  return (
    <Box className={classes.root} id="byoa-hud">
      <Container className={classes.speedDial}>
        <DragMove onDragMove={(e: any) => {
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
                connectWallet();
              }}
            />
            {installedApps.map((installedApp, i) => (
              <SpeedDialAction
                key={`sd-action-${installedApp.id}-${i}`}
                icon={<img style={{ width: '40px', height: '40px' }} src={resolveIpfs(installedApp.imageURI)} />}
                tooltipTitle={`${installedApp.app.name} ${installedApp.app.version}`}
                onClick={() => {
                  if (installedApp.byoaDetails.target === "iframe") { // TODO support javascript main thread plugins, right now it's just iframes as we focus on widgets and design our strategy for plugin security and communication with host apps
                    const c = getSingletonByoaAppContainer();
                    makeOrUpdateSingletonByoaAppIframe(c, resolveIpfs(installedApp.byoaDetails.uri));
                  }
                }}
              />
            ))}

          </SpeedDial>
        </DragMove>
      </Container>
    </Box>
  )
}
