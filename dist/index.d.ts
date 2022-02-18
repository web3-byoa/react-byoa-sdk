interface Props {
    dataPipe?: {
        data: any;
    };
    mode?: "l1" | "l2";
    byoaContractDetails?: {
        address?: string;
        network?: 'ropsten' | 'goerli' | 'rinkeby' | 'mainnet';
    };
    alchemyConfiguration?: {
        network?: 'ropsten' | 'goerli' | 'rinkeby' | 'mainnet';
        key?: string;
        url?: string;
    };
    infuraConfiguration?: {
        id?: string;
    };
    starknetConfiguration?: {
        address?: string;
        network?: 'goerli' | 'mainnet';
    };
    toggleExpandedView?: boolean;
}
export declare const ByoaSDK: (props: Props) => JSX.Element;
export {};
