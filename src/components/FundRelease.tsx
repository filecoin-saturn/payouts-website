import { CheckIcon } from '@chakra-ui/icons';
import {
    Box,
    Button,
    Card,
    CardBody,
    CardHeader,
    Center,
    Heading,
    HStack,
    Spinner,
    Stat,
    StatGroup,
    StatHelpText,
    StatLabel,
    StatNumber,
    VStack,
} from '@chakra-ui/react';
import { JsonRpcSigner } from '@ethersproject/providers';
import { Contract } from 'ethers';
import React from 'react';
import { useEffect, useState } from 'react';

import { UserInfo } from '../types';
import {
    getContract,
    isMetaMaskConnected,
    releasePayout,
    walletProvider,
} from '../utils/contract-utils';
import ErrorModal from './ErrorModal';

enum FundStates {
    initiated = 'initiated',
    released = 'released',
}

const FundRelease = (props: UserInfo) => {
    const [walletConnected, setWalletConnect] = useState<boolean>(false);
    const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
    const [contract, setContract] = useState<Contract | null>(null);
    const [error, setErrorState] = useState<Error | null>(null);
    const [fundsStatus, setfundsStatus] = useState<FundStates | undefined>(
        undefined
    );

    const userOutOfFunds = parseFloat(props.releasable) === 0;

    const connectWallet = async () => {
        const walletSigner = await walletProvider();
        if (!walletConnected) {
            setWalletConnect(true);
        }
        setSigner(walletSigner);
        return signer;
    };

    const releaseFunds = async () => {
        console.log(contract);
        if (contract) {
            setfundsStatus(FundStates.initiated);
            try {
                await releasePayout(contract, props.address);
                setfundsStatus(FundStates.released);
            } catch (error) {
                if (error instanceof Error) return setErrorState(error);
            }
        }
        return;
    };

    useEffect(() => {
        if (!walletConnected) {
            (async () => {
                const wallet = await isMetaMaskConnected();
                if (wallet) {
                    await connectWallet();
                    setWalletConnect(true);
                }
            })();
        }
        if (signer) {
            (async () => {
                try {
                    const contract = await getContract(signer);
                    setContract(contract);
                } catch (error) {
                    if (error instanceof Error) setErrorState(error);
                }
            })();
        }
        return;
    }, [signer]);

    const errorModal = error ? <ErrorModal error={error} modalOpen /> : null;
    console.log(fundsStatus);
    const userStats = (
        <StatGroup>
            <Stat>
                <StatLabel>Shares</StatLabel>
                <StatNumber>{props.shares} FIL</StatNumber>
                <StatHelpText>Total Shares</StatHelpText>
            </Stat>
            <Stat>
                <StatLabel>Released</StatLabel>
                <StatNumber>{props.released} FIL </StatNumber>
                <StatHelpText>Total Released</StatHelpText>
            </Stat>
            <Stat>
                <StatLabel>Owed</StatLabel>
                <StatNumber>{props.releasable} FIL </StatNumber>
                <StatHelpText>Remaining Shares</StatHelpText>
            </Stat>
        </StatGroup>
    );

    const connectedButton = (
        <Button
            aria-label="Wallet Connected"
            pointerEvents={'none'}
            leftIcon={<CheckIcon color={'green'} />}
        >
            Wallet Connected
        </Button>
    );

    const connectButton = (
        <Button onClick={() => connectWallet()}>Connect Wallet</Button>
    );
    const walletButton = walletConnected ? connectedButton : connectButton;

    const releaseButton = (
        <Button
            isDisabled={userOutOfFunds || !walletConnected}
            onClick={() => releaseFunds()}
        >
            Release Funds
        </Button>
    );

    const spinner = (
        <Box width="100%" position={'absolute'} alignSelf="center">
            <VStack spacing={4} w="100%">
                <Heading size={'lg'}> Releasing Funds</Heading>
                <Spinner size={'xl'} />
            </VStack>
        </Box>
    );

    const success = (
        <Box alignSelf="center" position={'absolute'}>
            <HStack>
                <CheckIcon margin={'auto'} color="green" w={12} h={12} />
                <Heading size="lg"> Funds Released</Heading>
            </HStack>
        </Box>
    );

    let status;
    switch (fundsStatus) {
        case FundStates.initiated:
            status = spinner;
            break;
        case FundStates.released:
            status = success;
            break;
    }

    return (
        <Box w={'100%'} h={'100vh'} backgroundColor={'gray.900'}>
            <Center w={'100%'} h={'100%'}>
                <Card
                    variant={'outline'}
                    padding={'2%'}
                    filter="auto"
                    blur={fundsStatus ? '4px' : 'none'}
                >
                    <CardHeader>
                        <Heading size="md"> Address: {props.address}</Heading>
                    </CardHeader>
                    <CardBody filter="auto">
                        {userStats}
                        <HStack
                            w={'100%'}
                            marginTop={'5'}
                            alignContent={'center'}
                        >
                            {walletButton}
                            {releaseButton}
                        </HStack>
                    </CardBody>
                </Card>
                {status}
                {errorModal}
            </Center>
        </Box>
    );
};

export default FundRelease;
