import { ExternalLinkIcon } from '@chakra-ui/icons';
import {
    Box,
    Button,
    Center,
    Heading,
    Link,
    Text,
    UseToastOptions,
    VStack,
} from '@chakra-ui/react';
import { useToast } from '@chakra-ui/react';
import { useEffect } from 'react';
import { Connector, useConnect } from 'wagmi';

import SaturnBackground from '../assets/SaturnBackground.png';
import { switchNetwork } from '../utils/contract-utils';
const env = import.meta.env;

const WalletConnect = () => {
    const { connect, connectors, error, isLoading, pendingConnector } =
        useConnect({
            chainId: parseInt(env.VITE_CHAIN_ID),
        });
    const toast = useToast();

    const userConnect = async (connector: Connector) => {
        if (window.ethereum && env.SWITCH) {
            await switchNetwork();
        }
        connect({ connector });
    };
    useEffect(() => {
        if (error) {
            toast.closeAll();
            const toastInfo: UseToastOptions = {
                title: 'Error Connecting',
                description: '',
                status: 'error',
                duration: 5000,
                position: 'top',
                isClosable: true,
            };
            if (error instanceof Error) {
                toastInfo.description = error.message;
            }
            toast(toastInfo);
        }
    });

    return (
        <Center
            w="100%"
            h="100vh"
            backgroundColor={'saturn.background'}
            backgroundImage={{ base: '', md: SaturnBackground }}
            backgroundRepeat="no-repeat"
            backgroundPosition={'right top'}
        >
            <VStack
                maxWidth={'800px'}
                backgroundColor={'saturn.component'}
                padding={8}
                rounded="md"
                spacing="8"
            >
                <Heading size="xl" color={'whiteAlpha.900'}>
                    Claim Your Saturn Node Earnings
                </Heading>
                <Heading size="md" color={'whiteAlpha.900'}>
                    To begin, securely connect your Filecoin wallet below.
                </Heading>

                {connectors.map((connector) => (
                    <Button
                        disabled={!connector.ready}
                        key={connector.id}
                        isLoading={
                            isLoading && connector.id === pendingConnector?.id
                        }
                        rounded="2xl"
                        variant={'outline'}
                        loadingText="Connecting"
                        color="whiteAlpha.800"
                        _hover={{ bg: 'saturn.button' }}
                        spinnerPlacement="end"
                        w="400px"
                        h="70px"
                        size={'lg'}
                        onClick={() => userConnect(connector)}
                    >
                        <Text color={'whiteAlpha.800'}>
                            {connector.name}
                            {!connector.ready}
                            {isLoading}
                        </Text>
                    </Button>
                ))}
                <Box>
                    <Heading size="md" color={'whiteAlpha.900'}>
                        <Link href="https://docs.saturn.tech/claim-your-rewards">
                            Documentation available here!{' '}
                            <ExternalLinkIcon mx="2px" />
                        </Link>
                    </Heading>
                </Box>
            </VStack>
        </Center>
    );
};

export default WalletConnect;
