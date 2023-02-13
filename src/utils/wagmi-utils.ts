import { Chain, configureChains, createClient, mainnet } from 'wagmi';
import { filecoin, filecoinHyperspace, localhost } from 'wagmi/chains';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { publicProvider } from 'wagmi/providers/public';

import contractAbi from '../abi.json';

const env = import.meta.env;
const FACTORY_ADDRESS = env.VITE_FACTORY_ADDRESS;

const localChains = [localhost, filecoinHyperspace];
const productionChains = [filecoin, filecoinHyperspace];
const supportedChains = (
    env.VITE_LOCAL ? localChains : productionChains
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

export function getUserInfo(address: string) {
    const functionReads: Array<object> = [];

    const functionsToRead = ['released', 'shares', 'releasable'];

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
