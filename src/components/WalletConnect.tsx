import { Box, Button, Center, VStack } from '@chakra-ui/react';
import { WagmiConfig } from 'wagmi';
import { useAccount, useConnect } from 'wagmi';

import { client } from '../utils/wallet-utils';
import Contract from './Contract';

function Profile() {
    const { connect, connectors, error, isLoading, pendingConnector } =
        useConnect();

    const { address, isConnecting, isDisconnected } = useAccount();

    return (
        <Box backgroundColor={'blue.900'} h="100vh" w="100%">
            <Center w="100%" h="100%">
                <VStack
                    w="100%"
                    maxWidth={'800px'}
                    backgroundColor={'whiteAlpha.900'}
                    padding={'5'}
                    spacing="4"
                >
                    {connectors.map((connector) => (
                        <Button
                            disabled={!connector.ready}
                            key={connector.id}
                            w="250px"
                            size={'lg'}
                            onClick={() => connect({ connector })}
                        >
                            {connector.name}
                            {!connector.ready}
                            {isLoading && connector.id === pendingConnector?.id}
                        </Button>
                    ))}
                </VStack>
            </Center>

            {/* {address && <Contract address={address} />} */}
            {/* {error && <div>{error.message}</div>} */}
        </Box>
    );
}

// Pass client to React Context Provider
export default function WalletConnect() {
    return (
        <WagmiConfig client={client}>
            <Profile />
        </WagmiConfig>
    );
}
