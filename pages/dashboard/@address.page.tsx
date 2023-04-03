import { Box, Image } from '@chakra-ui/react';

import { usePageContext } from '../../renderer/usePageContext';
import saturnLogo from '../../src/assets/SaturnLogoWithWord.png';
import UserDashboard from '../../src/components/Dashboard';

export { Page };

function Page() {
    const pageContext = usePageContext();
    const address = pageContext.routeParams?.address as string;
    const logo = (
        <Box maxW={'250px'} p={6}>
            <Image src={saturnLogo} alt="Saturn Logo" />
        </Box>
    );
    return (
        <Box
            backgroundColor={'saturn.background'}
            display="flex"
            minH={'100vh'}
            flexDirection="column"
            w="100%"
        >
            {logo}
            <UserDashboard address={address} />
        </Box>
    );
}
