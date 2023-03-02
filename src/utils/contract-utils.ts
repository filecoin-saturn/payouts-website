import { Contract } from '@ethersproject/contracts';
import {
    ExternalProvider,
    JsonRpcProvider,
    Web3Provider,
} from '@ethersproject/providers';
import type { Ethereum } from '@wagmi/connectors';
import { ethers, Signer } from 'ethers';

import Abi from '../abi.json';
import {
    ContractError,
    NetworkError,
    ProviderErrorCodes,
    ProviderRpcError,
} from '../types';

declare global {
    interface Window {
        ethereum?: Ethereum;
    }
}

const env = import.meta.env;
const RPC_URL = env.VITE_RPC_URL;
const CHAIN_ID = parseInt(env.VITE_CHAIN_ID as string);
const FACTORY_ADDRESS = env.VITE_FACTORY_ADDRESS;
const CHAIN_NAME = env.VITE_CHAIN_NAME;
const CHAIN_DECIMALS = parseInt(env.VITE_CHAIN_DECIMALS as string);
const CHAIN_SYMBOL = env.VITE_CHAIN_SYMBOL;

const CONTRACT_OPTS = {
    gasLimit: 10000000,
};
const production = import.meta.env.VITE_PRODUCTION;
const ATTO_FIL = production ? 10 ** 18 : 1;

export interface HexResponse {
    _hex: string;
    _isBigNumber: boolean;
}

export function parseHexObject(
    response: HexResponse,
    convertToFil: boolean
): string {
    const val = Number(response._hex);
    if (convertToFil) {
        const removeTrailingZerosRegex = /0+$/;
        let value = (val / ATTO_FIL)
            .toFixed(8)
            .replace(removeTrailingZerosRegex, '');

        const removeTrailingPeriodRegex = /\.(?!\d)/;
        value = value.replace(removeTrailingPeriodRegex, '');
        return value;
    }
    return val.toString();
}

export async function getContract(signer?: Signer): Promise<Contract> {
    const contractAbi = JSON.stringify(Abi);
    const readOnlyProvider = new JsonRpcProvider(RPC_URL, CHAIN_ID);

    const contractSigner = signer ? signer : readOnlyProvider;

    const contract = await new Contract(
        FACTORY_ADDRESS as string,
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
        throw new Error(ContractError.READ_CONTRACT, {
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
        throw new Error(ContractError.TRANSACTION, {
            cause,
        });
    }
    return transactionReceipt;
}

export async function walletProvider() {
    const provider = new Web3Provider(window.ethereum as ExternalProvider);

    try {
        await provider.send('eth_requestAccounts', []);
    } catch (error) {
        return null;
    }
    return provider.getSigner();
}

export const isMetaMaskConnected = async () => {
    const provider = new Web3Provider(window.ethereum as ExternalProvider);
    const accounts = await provider.listAccounts();
    return accounts.length > 0;
};

const addNetwork = async () => {
    const network = window.ethereum as any;

    try {
        await network.request({
            method: 'wallet_addEthereumChain',
            params: [
                {
                    chainName: CHAIN_NAME,
                    chainId: ethers.utils.hexValue(CHAIN_ID),
                    nativeCurrency: {
                        name: CHAIN_SYMBOL,
                        decimals: CHAIN_DECIMALS,
                        symbol: CHAIN_SYMBOL,
                    },
                    rpcUrls: [RPC_URL],
                },
            ],
        });
    } catch (error) {
        let cause;
        if (error instanceof Error) {
            cause = error.message;
        }
        throw new Error(NetworkError.CONNECTION_ERROR, {
            cause,
        });
    }
};

function instanceOfProviderError(object: any): object is ProviderRpcError {
    return object.message && object.code;
}

export const switchNetwork = async () => {
    const network = window.ethereum as any;
    if (network.networkVersion == CHAIN_ID) {
        return;
    }
    try {
        await network.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: ethers.utils.hexValue(CHAIN_ID) }],
        });
    } catch (error) {
        if (
            instanceOfProviderError(error) &&
            error.code == ProviderErrorCodes.CHAIN_DISCONNECTED
        ) {
            return await addNetwork();
        }
        let cause;
        if (error instanceof Error) {
            cause = error.message;
        }
        throw new Error(NetworkError.CONNECTION_ERROR, {
            cause,
        });
    }
    return;
};
