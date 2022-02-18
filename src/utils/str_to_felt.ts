import { BigNumber } from "ethers";

export const str_to_felt = (input : string) : BigNumber => {
    if(input.length > 31) throw new Error("Only short strings are supported");

    let hexString = "";
    for(let i = 0; i < input.length; i ++) {
        hexString += input.charCodeAt(i).toString(16);
    }

    return BigNumber.from(`0x${hexString}`);
}

export const str_to_felt_as_string = (input : string) : string => {
    let bn = str_to_felt(input);
    return bn.toString();
}

export const felt_to_str = (input : string) : string => {
    // Pull out the 0x if it exists
    let parsed = input;
    if(input.indexOf('0x') === 0) parsed = input.split('0x')[1];

    let output = "";
    if(parsed.length % 2 === 1) {
        parsed = "0" + parsed;
    }

    for(let i = 0; i < parsed.length; i += 2) {
        let curr = parsed.slice(i,i+2);
        let num = BigNumber.from(`0x${curr}`);
        output += String.fromCharCode(num.toNumber());
    }

    return output;
}