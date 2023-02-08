import { Contract } from '@ethersproject/contracts';
import {
    ExternalProvider,
    JsonRpcFetchFunc,
    JsonRpcProvider,
    Web3Provider,
} from '@ethersproject/providers';
import { Signer } from 'ethers';

import Abi from '../abi.json';
import { ContractErrorMessage } from '../types';

declare global {
    interface Window {
        ethereum: ExternalProvider | JsonRpcFetchFunc;
    }
}

// const RPC_URL = 'https://api.hyperspace.node.glif.io/rpc/v0';
// const CHAIN_ID = 3141;

// const CONTRACT_ADDRESS = '0x3Cfd761Ae56f87205A4c22F06bFCd2B8a224c0d7';
// const CONTRACT_OPTS = {
//     gasLimit: 1000000000,
// };
// const ATTO_FIL = 10 ** 18;

const RPC_URL = 'http://127.0.0.1:8545';
const CHAIN_ID = 31337;

const CONTRACT_ADDRESS = '0x5fbdb2315678afecb367f032d93f642f64180aa3';
const CONTRACT_OPTS = {
    gasLimit: 10000000,
};

const ATTO_FIL = 1;

interface HexResponse {
    _hex: string;
    _isBigNumber: boolean;
}

function parseHexObject(response: HexResponse, convertToFil: boolean): string {
    const value = Number(response._hex);
    if (convertToFil) {
        return (value / ATTO_FIL).toFixed(8).replace(/0+$/, '');
    }
    return value.toString();
}

export async function getContract(signer?: Signer): Promise<Contract> {
    const contractAbi = JSON.stringify(Abi);
    const readOnlyProvider = new JsonRpcProvider(RPC_URL, CHAIN_ID);

    const contractSigner = signer ? signer : readOnlyProvider;

    const contract = await new Contract(
        CONTRACT_ADDRESS,
        contractAbi,
        contractSigner
    );

    return contract;
}

export async function readUserInfo(contract: Contract, address: string) {
    let info;

    try {
        const shares = await contract.shares(address, CONTRACT_OPTS);
        const released = await contract.released(address, CONTRACT_OPTS);
        const releasable = await contract.releasable(address, CONTRACT_OPTS);

        const userInfo = {
            shares,
            releasable,
            released,
        };

        Object.keys(userInfo).map((key) => {
            const value = userInfo[key as keyof typeof userInfo];
            userInfo[key as keyof typeof userInfo] = parseHexObject(
                value,
                true
            );
        });
        info = userInfo;
    } catch (error: unknown) {
        let cause;
        if (error instanceof Error) {
            cause = error.message;
        }
        throw new Error(ContractErrorMessage.READ_CONTRACT, {
            cause,
        });
    }

    return info;
}

export async function releasePayout(contract: Contract, address: string) {
    let transactionReceipt;
    try {
        const release = await contract.releaseAll(address, CONTRACT_OPTS);
        transactionReceipt = await release.wait();
    } catch (error: unknown) {
        let cause;
        if (error instanceof Error) {
            cause = error.message;
        }
        throw new Error(ContractErrorMessage.TRANSACTION, {
            cause,
        });
    }
    return transactionReceipt;
}

export async function walletProvider() {
    const provider = new Web3Provider(window.ethereum);

    try {
        await provider.send('eth_requestAccounts', []);
    } catch (error) {
        return null;
    }
    return provider.getSigner();
}

export const isMetaMaskConnected = async () => {
    const provider = new Web3Provider(window.ethereum);
    const accounts = await provider.listAccounts();
    return accounts.length > 0;
};
