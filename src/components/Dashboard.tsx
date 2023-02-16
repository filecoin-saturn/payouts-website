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
    StatHelpText,
    StatLabel,
    StatNumber,
    Text,
    VStack,
} from '@chakra-ui/react';
import {
    Connector,
    useContractReads,
    useContractWrite,
    UseContractWriteConfig,
    useDisconnect,
    usePrepareContractWrite,
} from 'wagmi';

import {
    formatReadContractResponse,
    getRelease,
    getUserInfo,
    truncateEthAddress,
} from '../utils/wagmi-utils';
import DataTable from './DataTable';

const UserDashboard = (props: { address: string; connector: Connector }) => {
    const { disconnect } = useDisconnect();

    const address = props.address;
    const connector = props.connector;
    const contractFuncs = address && (getUserInfo(address) as any);

    const { data, isLoading, isFetching, error } = useContractReads({
        contracts: contractFuncs,
        select: (data) => formatReadContractResponse(data),
    });

    const { config } = usePrepareContractWrite(getRelease(address) as object);

    const {
        data: writeData,
        isLoading: contractLoading,
        isSuccess,
        write,
    } = useContractWrite({
        ...(config as UseContractWriteConfig),
        onSettled() {
            window.location.reload();
        },
    });

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
                <StatLabel>Released</StatLabel>
                <StatNumber>{data.stats.released} FIL</StatNumber>
                <StatHelpText>Total released funds</StatHelpText>
            </Stat>
            <Stat>
                <StatLabel>Shares</StatLabel>
                <StatNumber> {data.stats.shares} FIL </StatNumber>
                <StatHelpText>Total shares</StatHelpText>
            </Stat>
            <Stat>
                <StatLabel>Releasable</StatLabel>
                <StatNumber> {data.stats.releasable} FIL </StatNumber>
                <StatHelpText>Remaining unreleased funds</StatHelpText>
            </Stat>
        </StatGroup>
    );
    return (
        <Center>
            <Card w="100%" maxW={'1200px'} p="4">
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
                            isLoading={contractLoading}
                            isDisabled={
                                !data || parseFloat(data.stats.releasable) === 0
                            }
                            onClick={() => write?.()}
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
