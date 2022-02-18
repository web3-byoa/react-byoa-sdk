import { StarknetWindowObject } from '@argent/get-starknet/dist/extension.model';
import { ethers } from 'ethers';
import { getSelectorFromName } from 'starknet/dist/utils/stark';
import { felt_to_str } from '../utils/str_to_felt';
import Web3 from 'web3';
import abi from '../utils/abi/Byoa.json';


interface LoadL2DataParams  {
    swo: StarknetWindowObject;
    address: string;
    byoaContractDetails: {
        address: string;
    };
    alchemyConfiguration: {
        url: string;
    };
    starknetConfiguration: {
        address: string;
        network: 'goerli' | 'mainnet';
    };
};

export interface L2AppData {
    AppId: number;
    AppIndex: Number;
    ByoaApp: ByoaApp;
    IsInstalled: boolean;
    Params: {
        ID: string;
        Value: string;
    }[];
    Status: string;
};

export interface ByoaApp {
    id : Number;
    owner : String;
    name : String;
    description : String;
    tokenURI : String;
    address : String;
    price : Number;
    version: String;
};

const loadL2AppData =  (params : LoadL2DataParams) : Promise<L2AppData[]> => {
    return new Promise<L2AppData[]>(async (resolve, reject) => {
        if(params.swo) {
            let tAppData : L2AppData[] = [];
            try {
                let getAppLenResult = await params.swo.provider?.callContract({
                contract_address: params.starknetConfiguration.address,
                entry_point_selector: getSelectorFromName("get_app_len"),
                calldata: [ethers.BigNumber.from(params.address).toString()]
                });
                let numberOfApps = ethers.BigNumber.from(getAppLenResult.result[0]).toNumber();
                
                for(let i = 0; i < numberOfApps; i ++) {
                    let getAppArrayDataByIndexResult = await params.swo.provider?.callContract({
                        contract_address: params.starknetConfiguration.address,
                        entry_point_selector: getSelectorFromName("get_app_array"),
                        calldata: [ethers.BigNumber.from(params.address).toString(), `${i}`]
                    });
                    let appIdAtIndex = ethers.BigNumber.from(getAppArrayDataByIndexResult.result[0]).toNumber();

                    let isInstalledResult = await params.swo.provider?.callContract({
                        contract_address: params.starknetConfiguration.address,
                        entry_point_selector: getSelectorFromName("get_app_installation"),
                        calldata: [ethers.BigNumber.from(params.address).toString(), `${i}`]
                    });

                    let isInstalled = (ethers.BigNumber.from(isInstalledResult.result[0]).toNumber() === 1);
                    if(!isInstalled) {
                        continue;
                    }

                    let appParamCountResult = await params.swo.provider?.callContract({
                        contract_address: params.starknetConfiguration.address,
                        entry_point_selector: getSelectorFromName("get_app_param_count"),
                        calldata: [ethers.BigNumber.from(params.address).toString(), `${i}`]
                    });

                    let configuredAppParams : any = [];
                    for(let j = 0; j < ethers.BigNumber.from(appParamCountResult.result[0]).toNumber(); j ++) {
                        let appParamValuesByIndexResult = await params.swo.provider?.callContract({
                            contract_address: params.starknetConfiguration.address,
                            entry_point_selector: getSelectorFromName("get_app_param_value_array"),
                            calldata: [ethers.BigNumber.from(params.address).toString(), `${i}`, `${j}`]
                        });
                        
                        configuredAppParams.push({
                            ID: felt_to_str(appParamValuesByIndexResult.result[0]),
                            Value: felt_to_str(appParamValuesByIndexResult.result[1]),
                        });

                    }

                    let l1AppData = await fetchAppDetailById(appIdAtIndex, params);
                    tAppData.push({
                        AppId: appIdAtIndex,
                        AppIndex: i,
                        Params: configuredAppParams,
                        Status: 'ACCEPTED',
                        IsInstalled: ethers.BigNumber.from(isInstalledResult.result[0]).toNumber() === 1,
                        ByoaApp: l1AppData
                    });

                }

                resolve(tAppData);

            } catch (error) {
                reject(error);
            } finally {
                
            }
        } else {
            resolve([]);
        }
    })
};

const fetchAppDetailById = async (appId : number, params : LoadL2DataParams) : Promise<ByoaApp> => {
    return new Promise<ByoaApp>(async (resolve, reject) => {
        let w3 = new Web3(params.alchemyConfiguration.url);
        try {
            // @ts-expect-error
            let contract = new w3.eth.Contract(abi.abi, params.byoaContractDetails.address);
        
            // Get the details
            let appDetails = await contract.methods.getAppDetailsById(appId).call();
            
            let app : ByoaApp = {
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
        
        } catch( error ) {
            console.log(`Error fetching apps: ${error}`) ;
            reject(error);
        } finally {
        
        }
    })
};

export {
    loadL2AppData
};