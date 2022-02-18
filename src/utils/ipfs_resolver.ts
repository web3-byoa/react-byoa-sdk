import CID from 'cids';

export const resolveIpfs = (ipfsURI : String | string) : string=> {
    if(ipfsURI.indexOf("ipfs://") >= 0) {
        let comps = ipfsURI.split("ipfs://");
        let uri = comps[1];
        if(uri.indexOf("ipfs/") >= 0) {
            // TODO convert to CIDv1 as is done below
            return `https://cloudflare-ipfs.com/${uri}`;
        } else {
            return `https://${new CID(uri).toV1().toString()}.ipfs.cf-ipfs.com`; // here we resolve the ipfs URI to a subdomain-based gateway. This has two benefits. One, it provides same-origin security that's scoped to the ipfs uri. Two, if the ipfs URI is a react app, typically that react app has been built to be served from the domain root, and a subdomain-based gateway provides this, whereas a CIDv0 gateway has `/ipfs/<CIDv0>`
        }
    } else {
        return ipfsURI as string;
    }
};
