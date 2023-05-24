import { newFromString } from '@glif/filecoin-address';
import { hexlify } from 'ethers/lib/utils.js';
import { Chain, configureChains, createClient } from 'wagmi';
import {
    filecoin,
    filecoinCalibration,
    filecoinHyperspace,
    localhost,
} from 'wagmi/chains';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { publicProvider } from 'wagmi/providers/public';

import contractAbi from '../abi.json';
import {
    ContractItem,
    DashboardContracts,
    DashboardWriteContractData,
} from '../types';
import { HexResponse, parseHexObject } from './contract-utils';
const env = import.meta.env;
const FACTORY_ADDRESS = env.VITE_FACTORY_ADDRESS;

// Hacky way to make the localhost chain properties writable.
const localhostChain = JSON.parse(JSON.stringify(localhost));
if (!env.VITE_PRODUCTION) {
    localhostChain.id = parseInt(import.meta.env.VITE_CHAIN_ID);
}
const localChains = [localhostChain, filecoinHyperspace, filecoinCalibration];
const productionChains = [filecoin, filecoinHyperspace, filecoinCalibration];
const supportedChains = (
    env.VITE_PRODUCTION ? productionChains : localChains
) as Array<Chain>;

const CHAIN_ID = parseInt(env.VITE_CHAIN_ID);

const { chains, provider, webSocketProvider } = configureChains(
    supportedChains,
    [publicProvider()]
);

// Set up client
export const client = createClient({
    autoConnect: true,
    connectors: [
        new MetaMaskConnector({ chains }),
        new CoinbaseWalletConnector({
            chains,
            options: {
                appName: 'wagmi',
            },
        }),
        new WalletConnectConnector({
            chains,
            options: {
                qrcode: true,
            },
        }),
        new InjectedConnector({
            chains,
            options: {
                name: 'Browser Detected Wallet',
                shimDisconnect: true,
            },
        }),
    ],
    provider,
    webSocketProvider,
});

export const factoryContract = {
    address: FACTORY_ADDRESS,
    abi: contractAbi,
};

export function getRelease(address: string) {
    const addr = formatAddressForContract(address);

    return {
        ...factoryContract,
        functionName: 'releaseAll',
        args: [addr],
    };
}

export function formatReadContractResponse(
    data: Array<any>,
    pending: string | null
): DashboardWriteContractData {
    const statArray = data
        ?.slice(0, 3)
        .map((item) => parseHexObject(item as HexResponse, true));
    const releasedContracts: DashboardContracts = {};
    const releasableContracts: DashboardContracts = {};

    const stats = {
        released: statArray[0],
        shares: statArray[1],
        releasable: statArray[2],
    };

    const [contracts, releasable, released] = data[3];
    contracts.forEach((address: string, idx: number) => {
        // Ignore zero address
        if (parseInt(address) > 0) {
            const contractFunds = parseHexObject(releasable[idx], true);
            const contractItem: ContractItem = {
                address,
                funds: contractFunds,
                checked: false,
                pending: pending ? true : false,
            };
            if (parseFloat(contractFunds) === 0) {
                contractItem.funds = parseHexObject(released[idx], true);
                releasedContracts[address as keyof DashboardContracts] =
                    contractItem;
            } else {
                releasableContracts[address as keyof DashboardContracts] =
                    contractItem;
            }
        }
    });

    return { stats, releasableContracts, releasedContracts };
}

export function getUserInfo(address: string) {
    const functionReads: Array<object> = [];

    const functionsToRead = [
        'released',
        'shares',
        'releasable',
        'releasablePerContract',
    ];

    const addr = formatAddressForContract(address);

    functionsToRead.forEach((name) => {
        functionReads.push({
            ...factoryContract,
            functionName: name,
            chainId: CHAIN_ID,
            args: [addr],
        });
    });

    return functionReads;
}

export const formatAddressForContract = (address: string) => {
    return [hexlify(Array.from(newFromString(address).bytes))];
};
// Captures 0x + 5 characters, then the last 5 characters.
const truncateEthRegex = /^(0x[a-zA-Z0-9]{5})[a-zA-Z0-9]+([a-zA-Z0-9]{5})$/;

export const truncateEthAddress = (address: string) => {
    const match = address.match(truncateEthRegex);
    if (!match) return address;
    return `${match[1]}…${match[2]}`;
};

export const truncateFilecoinAddress = (address: string) => {
    // Captures t + 8 characters, then the last 8 characters.
    let truncateFilecoinRegex =
        /^(t[a-zA-Z0-9]{8})[a-zA-Z0-9]+([a-zA-Z0-9]{8})$/;

    if (address[0] === 'f') {
        truncateFilecoinRegex =
            /^(f[a-zA-Z0-9]{8})[a-zA-Z0-9]+([a-zA-Z0-9]{8})$/;
    }
    const match = address.match(truncateFilecoinRegex);
    if (!match) return address;
    return `${match[1]}…${match[2]}`;
};
