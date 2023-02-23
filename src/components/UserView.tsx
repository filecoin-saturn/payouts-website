import { Box, Image } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

import saturnLogo from '../assets/SaturnLogoWithWord.png';
import UserDashboard from './Dashboard';
import LoadingPage from './LoadingPage';
import WalletConnect from './WalletConnect';
const UserView = () => {
    const [firstLoad, setFirstLoad] = useState(false);
    const { address, connector, isConnected, isConnecting, status } =
        useAccount();

    useEffect(() => {
        if (!firstLoad && status !== 'connecting') {
            setFirstLoad(true);
        }
    }, [status]);
    let view;
    if (!firstLoad) {
        view = <LoadingPage />;
    } else if (isConnected && address && connector) {
        view = <UserDashboard address={address} connector={connector} />;
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

export default UserView;
