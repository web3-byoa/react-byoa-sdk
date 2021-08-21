import { ByoaApp } from "./byoaApp";

export interface InstalledApp {
    id: Number;
    tokenURI: String;
    imageURI: String;
    byoaDetails: ByoaDetails;
    app: ByoaApp;
};

export interface ByoaDetails {
    uri: String;
    target : "host" | "iframe" | "mallows";
}