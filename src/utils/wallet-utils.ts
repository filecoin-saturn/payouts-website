import { Chain, configureChains, createClient, mainnet } from 'wagmi';
import { filecoin, filecoinHyperspace, localhost } from 'wagmi/chains';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { publicProvider } from 'wagmi/providers/public';

const env = import.meta.env;
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
const client = createClient({
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

export { client };
