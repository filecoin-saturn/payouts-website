import {
    Avatar,
    Box,
    Button,
    Card,
    CardBody,
    CardHeader,
    Center,
    Divider,
    Heading,
    HStack,
    Skeleton,
    Stack,
    Stat,
    StatGroup,
    StatLabel,
    StatNumber,
    Text,
    VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import {
    useAccount,
    useBalance,
    useContractReads,
    useContractWrite,
    UseContractWriteConfig,
    useDisconnect,
    useNetwork,
    usePrepareContractWrite,
} from 'wagmi';

import {
    ContractError,
    DashboardWriteContractData,
    InfoModalType,
} from '../types';
import {
    formatReadContractResponse,
    getRelease,
    getUserInfo,
    truncateEthAddress,
    truncateFilecoinAddress,
} from '../utils/wagmi-utils';
import DataTable from './DataTable';
import InfoModal from './InfoModal';

const env = import.meta.env;
const CHAIN_ID = parseInt(env.VITE_CHAIN_ID);
const FIL_BALANCE_MAX_DIGITS = 7;

type Address = `0x${string}`;

const UserDashboard = (props: { address: string }) => {
    const [mounted, setMounted] = useState(false);
    const [pending, setAllPending] = useState<string | null>(null);
    const [fetchedData, setFetchedData] = useState<
        DashboardWriteContractData | undefined
    >(undefined);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { disconnect } = useDisconnect();
    const { chain } = useNetwork();

    useEffect(() => {
        if (chain?.id != CHAIN_ID) {
            disconnect();
        }
    }, [chain]);

    const address = props.address;
    const { address: walletAddress, connector, status } = useAccount();
    if (status === 'disconnected') {
        window.location.href = '/connect';
    }

    const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
        address: walletAddress as Address,
    });

    const contractFuncs = address && (getUserInfo(address) as any);
    const { data, isLoading, isRefetching } = useContractReads({
        contracts: contractFuncs,
        select: (data) => formatReadContractResponse(data, pending),
        watch: true,
    });

    useEffect(() => {
        setFetchedData(data);
    }, [data]);
    const { config } = usePrepareContractWrite(getRelease(address) as object);

    const [txLoading, setTxLoading] = useState(false);

    const { isLoading: contractLoading, write } = useContractWrite({
        ...(config as UseContractWriteConfig),
        async onSettled(data) {
            setTxLoading(false);
            data && setAllPending(data.hash);
            try {
                await data?.wait();
                setAllPending(null);
            } catch (error) {
                let cause;
                if (error instanceof Error) {
                    cause = error.message;
                }
                throw new Error(ContractError.TRANSACTION, {
                    cause,
                });
            }
        },
    });
    const writeContract = () => {
        if (write) {
            setTxLoading(true);
            write();
        }
    };

    const skeletonComp = <Skeleton height="20px" />;

    const loadingSkeleton = (
        <Stack>
            <Skeleton height="20px" />
            <Skeleton height="20px" />
            <Skeleton height="20px" />
        </Stack>
    );

    const balance = isBalanceLoading ? (
        skeletonComp
    ) : (
        <Text fontSize={'md'} fontWeight="bold" alignSelf={'flex-start'}>
            {connector?.name} Balance:{' '}
            {balanceData?.formatted.slice(0, FIL_BALANCE_MAX_DIGITS)}{' '}
            {balanceData?.symbol}
        </Text>
    );

    const hasZeroBalance = balanceData
        ? parseFloat(balanceData.formatted) === 0
        : false;

    let infoModal;
    if (hasZeroBalance) {
        const gasFeeMessage =
            'To claim earnings you must have FIL to cover gas fees' +
            ' your account balance is currently zero so you will only be able to view but not claim' +
            ' earnings. To claim earnings, please transfer some FIL in your account to cover gas fees.';

        infoModal = (
            <InfoModal
                modalType={InfoModalType.warning}
                message={gasFeeMessage}
                title={'Gas Fees'}
            />
        );
    }

    const header = address && connector && (
        <>
            <HStack spacing={'10'} flexWrap="wrap">
                <Avatar size={'xl'} />
                <VStack spacing={0}>
                    <Heading size={'lg'} alignSelf="flex-start" mb={3}>
                        Viewing earnings for {truncateFilecoinAddress(address)}
                    </Heading>
                    <Text
                        fontSize={'md'}
                        fontWeight="bold"
                        alignSelf={'flex-start'}
                    >
                        Connected to{' '}
                        {truncateEthAddress(walletAddress as string)}
                    </Text>
                    {balance}
                    <Text
                        fontSize={'md'}
                        fontWeight="bold"
                        alignSelf={'flex-start'}
                    >
                        Network: {chain?.name}
                    </Text>
                </VStack>
            </HStack>
            <Button size={'lg'} float="right" onClick={() => disconnect()}>
                Disconnect
            </Button>
        </>
    );

    const stats = fetchedData && (
        <>
            <StatGroup mb={5} mt={4}>
                <Stat>
                    <StatLabel>
                        <Heading size="sm"> Total Earnings</Heading>
                    </StatLabel>
                    <StatNumber> {fetchedData.stats.shares} FIL </StatNumber>
                </Stat>
                <Stat>
                    <StatLabel>
                        <Heading size="sm"> Released Earnings</Heading>
                    </StatLabel>
                    <StatNumber>{fetchedData.stats.released} FIL</StatNumber>
                </Stat>
                <Stat>
                    <StatLabel>
                        <Heading size="sm"> Claimable Earnings</Heading>
                    </StatLabel>
                    <StatNumber>
                        {' '}
                        {fetchedData.stats.releasable} FIL{' '}
                    </StatNumber>
                </Stat>
            </StatGroup>
        </>
    );

    if (!mounted) {
        return null;
    }
    // console.log(fetchedData?.releasableContracts);

    return (
        <Center>
            {infoModal}
            <Card w="100%" maxW={'1200px'} p="4" m={6}>
                <CardHeader w="100%">
                    <Stack
                        mt={5}
                        direction="row"
                        flexWrap={'wrap'}
                        justifyContent={'space-between'}
                    >
                        {header}
                    </Stack>
                    <Divider mt={1} mb={2} />

                    <CardBody>
                        {isLoading ? loadingSkeleton : stats}
                        <VStack>
                            <Box
                                w="100%"
                                display={'flex'}
                                justifyContent="right"
                                marginRight={12}
                            >
                                <Button
                                    isLoading={txLoading || contractLoading}
                                    isDisabled={
                                        !fetchedData ||
                                        hasZeroBalance ||
                                        parseFloat(
                                            fetchedData.stats.releasable
                                        ) === 0
                                    }
                                    loadingText="Releasing Funds"
                                    onClick={() => writeContract()}
                                    float="right"
                                >
                                    Release All Funds
                                </Button>
                            </Box>

                            <DataTable
                                contracts={
                                    fetchedData?.releasableContracts || {}
                                }
                                releasedContracts={
                                    fetchedData?.releasedContracts || {}
                                }
                                zeroFunds={hasZeroBalance}
                                allPendingHash={pending}
                                setDashboardTxLoading={setTxLoading}
                                address={address}
                            />
                        </VStack>
                    </CardBody>
                </CardHeader>
            </Card>
        </Center>
    );
};
export default UserDashboard;
