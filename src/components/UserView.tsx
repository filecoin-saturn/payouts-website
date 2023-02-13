import { Box, Image } from '@chakra-ui/react';
import { useAccount } from 'wagmi';

import saturnLogo from '../assets/SaturnLogoWithWord.png';
import UserDashboard from './Dashboard';
import WalletConnect from './WalletConnect';

const UserView = () => {
    const { address, connector, isConnected } = useAccount();

    let view;
    if (isConnected && address && connector) {
        view = <UserDashboard address={address} connector={connector} />;
    } else {
        view = <WalletConnect />;
    }
    const logo = (
        <Box maxW={'250px'} p={6}>
            <Image src={saturnLogo} alt="Saturn Logo" />
        </Box>
    );
    return (
        <Box backgroundColor={'blackAlpha.900'} h="100vh" w="100%">
            {logo}
            {view}
        </Box>
    );
};

export default UserView;
