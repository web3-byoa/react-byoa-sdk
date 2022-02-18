import { ByoaApp } from "./byoaApp";
export interface InstalledApp {
    id: Number;
    tokenURI: string;
    imageURI: string;
    byoaDetails: ByoaDetails;
    app: ByoaApp;
}
export interface ByoaDetails {
    uri: string;
    target: "host" | "iframe" | "mallows";
}
