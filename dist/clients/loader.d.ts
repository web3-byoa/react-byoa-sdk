import { StarknetWindowObject } from '@argent/get-starknet/dist/extension.model';
interface LoadL2DataParams {
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
}
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
}
export interface ByoaApp {
    id: Number;
    owner: String;
    name: String;
    description: String;
    tokenURI: String;
    address: String;
    price: Number;
    version: String;
}
declare const loadL2AppData: (params: LoadL2DataParams) => Promise<L2AppData[]>;
export { loadL2AppData };
