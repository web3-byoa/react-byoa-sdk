export const resolveIpfs = (ipfsURI : String | string) : string=> {
    if(ipfsURI.indexOf("ipfs://") >= 0) {
        let comps = ipfsURI.split("ipfs://");
        let uri = comps[1];
        if(uri.indexOf("ipfs/") >= 0) {
            return `https://cloudflare-ipfs.com/${uri}`;
        } else {
            return `https://cloudflare-ipfs.com/ipfs/${uri}`;
        }
    } else {
        return ipfsURI as string;
    }
};
