import { Chain, configureChains, createClient, mainnet } from 'wagmi';
import { filecoin, filecoinHyperspace, localhost } from 'wagmi/chains';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { publicProvider } from 'wagmi/providers/public';

import contractAbi from '../abi.json';
import { ContractItem, DashboardContracts } from '../types';
import { HexResponse, parseHexObject } from './contract-utils';
const env = import.meta.env;
const FACTORY_ADDRESS = env.VITE_FACTORY_ADDRESS;

// Hacky way to make the localhost chain properties writable.
const localhostChain = JSON.parse(JSON.stringify(localhost));
localhostChain.id = parseInt(import.meta.env.VITE_CHAIN_ID);
const localChains = [localhostChain, filecoinHyperspace];
const productionChains = [filecoin, filecoinHyperspace];
const supportedChains = (
    env.VITE_PRODUCTION ? productionChains : localChains
) as Array<Chain>;

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
                name: 'Injected',
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
    return {
        ...factoryContract,
        functionName: 'releaseAll',
        args: [address],
    };
}

export function formatReadContractResponse(data: Array<any>) {
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
        const contractFunds = parseHexObject(releasable[idx], true);
        const contractItem: ContractItem = {
            address,
            funds: contractFunds,
            checked: false,
        };
        if (parseFloat(contractFunds) === 0) {
            contractItem.funds = parseHexObject(released[idx], true);
            releasedContracts[address as keyof DashboardContracts] =
                contractItem;
        } else {
            releasableContracts[address as keyof DashboardContracts] =
                contractItem;
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

    functionsToRead.forEach((name) => {
        functionReads.push({
            ...factoryContract,
            functionName: name,
            args: [address],
        });
    });

    return functionReads;
}

// Captures 0x + 5 characters, then the last 5 characters.
const truncateRegex = /^(0x[a-zA-Z0-9]{5})[a-zA-Z0-9]+([a-zA-Z0-9]{5})$/;

export const truncateEthAddress = (address: string) => {
    const match = address.match(truncateRegex);
    if (!match) return address;
    return `${match[1]}…${match[2]}`;
};
