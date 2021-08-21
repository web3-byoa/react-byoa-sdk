import { Box, Container, makeStyles, Typography } from '@material-ui/core';
import { SpeedDial, SpeedDialAction } from '@material-ui/lab';
import * as React from 'react';
import DragMove from './components/DragMove';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import WalletConnectProvider from '@walletconnect/web3-provider';
import PetsIcon from '@material-ui/icons/Pets';

import Web3 from 'web3';
import Web3Modal from "web3modal";
import { InstalledApp } from './types/installedApp';
import abi from './utils/abi/Byoa.json';
import { ethers } from 'ethers';

interface Props {
  dataPipe? : {
    data: any
  }
}

const byoaContractAddress = `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`;
const providerNetwork = `http://localhost:8545`;
const jrpcProvider = new ethers.providers.JsonRpcProvider('https://eth-mainnet.alchemyapi.io/v2/Uo717K-DDAxlSM5gXM-zgv678k0aMZH5', 'mainnet');

let listeners : any = [];
// @ts-expect-error
window.byoa = {
  context: {
    target: {
      hud: "byoa-hud"
    },
    ethers: ethers,
    provider: ethers.getDefaultProvider('https://eth-mainnet.alchemyapi.io/v2/Uo717K-DDAxlSM5gXM-zgv678k0aMZH5'),
    jrpcProvider: jrpcProvider,
    addDataListener: (cb : any) => {
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

// @ts-expect-error
export const ByoaSDK = (props : Props) => {
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
        if(p === null) {
          throw new Error('Unable to connect provider to modal');
        }
        p.on('accountsChanged', (e : any) => {
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

      const accounts = await p.request({method: 'eth_accounts'});
      if (accounts.length > 0) {
        setAccountAddress(accounts[0]);
        setTimeout( async () => {
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

  const getTokenMetadata = async (uri : string) : Promise<any> =>  {
    return new Promise<any>( (resolve) => {
      resolve({
        meta: uri,
        image: "ipfs://QmYoSTehmdFUnSYCFrYdvSrEtNGy9U5gWEfroCTMGecHKw/0.png",
        byoa: {
          browser: {
            uri: "http://localhost:3000/scripts/example1.js",
            target: "host"
          }
        }
      });
    });
  };

  const transformIPFSToPinned = (ipfsURI : String) : String => {
    return `${ipfsURI}`;
  }

  const refreshMyApps = async (addressHelper : String | undefined | null) => {
    let w3 = new Web3(providerNetwork);
    try {
        // @ts-expect-error
        let contract = new w3.eth.Contract(abi.abi, byoaContractAddress);
      
        let myTokenIds = await contract.methods.walletOfOwner(accountAddress ? accountAddress : addressHelper).call();
        console.log(myTokenIds);

        let appLUT : any = {};
        

        let allInstalls : InstalledApp[] = [];
        for (var i = 0; i < myTokenIds.length; i ++) {
            let tid = parseInt(myTokenIds[i]);
            let appIdForToken = await contract.methods.getAppIdByTokenId(tid).call();
            let directTokenURI = await contract.methods.tokenURI(tid).call();
            let tokenMeta = await getTokenMetadata(directTokenURI);
            
            if(appLUT[appIdForToken] !== null) {
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
                version: 'beta v0.1' 
              }
            }

            let ia : InstalledApp = {
                id: tid,
                tokenURI: directTokenURI,
                app: appLUT[appIdForToken],
                imageURI: tokenMeta.image,
                byoaDetails: {
                  uri: tokenMeta.byoa.browser.uri,
                  target: tokenMeta.byoa.browser.target
                }
            }

            allInstalls.push(ia);
        }
        console.log(allInstalls)
        setInstalledApps(allInstalls);
      
    } catch( error ) {
      console.log(`Error fetching apps: ${error}`) ;
    }
  };
  
  return (
    <Box className={classes.root} id="byoa-hud">
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
                connectWallet();
              }}
            />
            {installedApps.map((installedApp, i) => (
              <SpeedDialAction
                key={`sd-action-${installedApp.id}-${i}`}
                icon={<PetsIcon />}
                tooltipTitle={`${installedApp.app.name} (#${installedApp.id})`}
                onClick={() => {
                  let scriptID = `byoa-${installedApp.id}-${installedApp.app.id}`;
                  const existingApp = document.getElementById(scriptID);
                  if (!existingApp) {
                    const script = document.createElement('script');
                    script.src = transformIPFSToPinned(installedApp.byoaDetails.uri) as string;
                    script.id = scriptID;
                    if(installedApp.byoaDetails.target == "host") {
                      document.body.appendChild(script);
                      script.onload = () => {
                        // The script has loaded, possibly pass providers to it now
                        console.log('loaded script');
                      }
                    }
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
