import { Box, Image } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi';

import saturnLogo from '../assets/SaturnLogoWithWord.png';
import AddressChangeForm from './AddressChangeForm';
import UserDashboard from './Dashboard';
import LoadingPage from './LoadingPage';
import WalletConnect from './WalletConnect';

const CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID);

const UserView = () => {
    const [firstLoad, setFirstLoad] = useState(false);
    const { address, connector, isConnected, status } = useAccount();
    const { chain } = useNetwork();
    const { switchNetwork } = useSwitchNetwork();

    useEffect(() => {
        if (chain) {
            if (chain.id !== CHAIN_ID) {
                switchNetwork?.(CHAIN_ID);
            }
        }
    }, [address, chain]);

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
        <Box maxW={'250px'} p={6}>
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

export default UserView;
