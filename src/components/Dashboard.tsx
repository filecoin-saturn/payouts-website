import {
    Avatar,
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
    useContractReads,
    UseContractReadsConfig,
    useContractWrite,
    UseContractWriteConfig,
    useDisconnect,
    usePrepareContractWrite,
} from 'wagmi';

import { ContractError } from '../types';
import {
    formatReadContractResponse,
    getRelease,
    getUserInfo,
    truncateEthAddress,
} from '../utils/wagmi-utils';
import DataTable from './DataTable';

const UserDashboard = (props: { address: string }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { disconnect } = useDisconnect();

    const address = props.address;
    const { connector, status } = useAccount();
    if (status === 'disconnected') {
        window.location.href = '/connect';
    }
    const contractFuncs = address && (getUserInfo(address) as any);
    const { data, isLoading } = useContractReads({
        contracts: contractFuncs,
        select: (data) => formatReadContractResponse(data),
    });

    const { config } = usePrepareContractWrite(getRelease(address) as object);

    const [txLoading, setTxLoading] = useState(false);

    const {
        data: writeData,
        isLoading: contractLoading,
        write,
    } = useContractWrite({
        ...(config as UseContractWriteConfig),
        async onSettled(data) {
            try {
                await data?.wait();
                setTxLoading(false);
                window.location.reload();
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

    const loadingSkeleton = (
        <Stack>
            <Skeleton height="20px" />
            <Skeleton height="20px" />
            <Skeleton height="20px" />
        </Stack>
    );
    const header = address && connector && (
        <>
            <HStack spacing={'10'} flexWrap="wrap">
                <Avatar size={'lg'} />
                <VStack>
                    <Heading size={'lg'} alignSelf="flex-start">
                        {truncateEthAddress(address)}{' '}
                    </Heading>
                    <Text alignSelf={'flex-start'}>
                        Connected to {connector.name}
                    </Text>
                </VStack>
            </HStack>
            <Button size={'lg'} float="right" onClick={() => disconnect()}>
                Disconnect
            </Button>
        </>
    );

    const stats = data && (
        <StatGroup mb={5}>
            <Stat>
                <StatLabel>
                    <Heading size="sm"> Total Earnings</Heading>
                </StatLabel>
                <StatNumber> {data.stats.shares} FIL </StatNumber>
            </Stat>
            <Stat>
                <StatLabel>
                    <Heading size="sm"> Released Earnings</Heading>
                </StatLabel>
                <StatNumber>{data.stats.released} FIL</StatNumber>
            </Stat>
            <Stat>
                <StatLabel>
                    <Heading size="sm"> Claimable Earnings</Heading>
                </StatLabel>
                <StatNumber> {data.stats.releasable} FIL </StatNumber>
            </Stat>
        </StatGroup>
    );

    if (!mounted) {
        return null;
    }
    return (
        <Center>
            <Card w="100%" maxW={'1200px'} p="4" mb={6}>
                <CardHeader w="100%">
                    <Stack
                        mt={5}
                        direction="row"
                        flexWrap={'wrap'}
                        justifyContent={'space-between'}
                    >
                        {header}
                    </Stack>
                    <Divider mt={10} mb={2} />

                    <CardBody>
                        {isLoading ? loadingSkeleton : stats}

                        <Button
                            isLoading={txLoading || contractLoading}
                            isDisabled={
                                !data || parseFloat(data.stats.releasable) === 0
                            }
                            onClick={() => writeContract()}
                        >
                            Release All Funds
                        </Button>

                        <DataTable
                            contracts={data?.releasableContracts || {}}
                            releasedContracts={data?.releasedContracts || {}}
                            address={address}
                        />
                    </CardBody>
                </CardHeader>
            </Card>
        </Center>
    );
};
export default UserDashboard;
