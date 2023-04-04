import { Box, Image } from '@chakra-ui/react';
import { connect } from '@wagmi/core';
import React, { useEffect, useState } from 'react';
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi';

import saturnLogo from '../assets/SaturnLogoWithWord.png';
import { connectors } from '../utils/wagmi-utils';
import AddressChangeForm from './AddressChangeForm';
import LoadingPage from './LoadingPage';
import WalletConnect from './WalletConnect';

const CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID);

const UserView = () => {
    const [firstLoad, setFirstLoad] = useState(false);

    const [dummy, setTest] = useState({});
    console.log(dummy);
    const { chain } = useNetwork();
    const { switchNetwork } = useSwitchNetwork();

    // if (!isConnected) {
    //     connectors.injected.connect({
    //         chainId: CHAIN_ID,
    //     });
    // }

    useEffect(() => {
        const testConnect = async () => {
            const test = await connectors.injected.connect({
                chainId: CHAIN_ID,
            });
            const account = await connectors.injected.getAccount();
            console.log(test);
            console.log(account);
            setTest({ test: 1 });
        };

        const connect2 = async () => {
            await connect({
                chainId: CHAIN_ID,
                connector: connectors.injected,
            });
        };
        const checkConnection = localStorage.getItem('wagmi.connected');
        const connectedWallet = localStorage.getItem('wagmi.wallet');
        // console.log(checkConnection === 'true');
        // console.log(connectedWallet === '"injected"');
        console.log(checkConnection, connectedWallet);
        // if (checkConnection && connectedWallet == 'injected') {
        //     console.log('here');
        // }
        testConnect().catch((err) => console.log(err));
        connect2().catch((err) => console.log(err));
        // if (chain) {
        //     if (chain.id !== CHAIN_ID) {
        //         switchNetwork?.(CHAIN_ID);
        //     }
        // }
    }, [chain, switchNetwork]);

    const { address, connector, isConnected, status } = useAccount();
    console.log(address, isConnected, status);

    useEffect(() => {
        if (!firstLoad && status !== 'connecting') {
            setFirstLoad(true);
        }
    }, [status]);

    let view;
    if (!firstLoad) {
        view = <LoadingPage />;
    } else if (isConnected && address && connector) {
        view = <AddressChangeForm address={address} connector={connector} />;
    } else {
        view = <WalletConnect />;
    }
    const logo = (
        <Box maxW={'250px'} p={6} position="absolute">
            <Image src={saturnLogo} alt="Saturn Logo" />
        </Box>
    );
    return (
        <Box
            backgroundColor={'blackAlpha.900'}
            display="flex"
            minH={'100vh'}
            flexDirection="column"
            w="100%"
        >
            {logo}
            {view}
        </Box>
    );
};

export default React.memo(UserView);
