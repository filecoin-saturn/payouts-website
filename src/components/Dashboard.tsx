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
import { Connector, useContractReads, useDisconnect } from 'wagmi';

import { HexResponse, parseHexObject } from '../utils/contract-utils';
import { getUserInfo, truncateEthAddress } from '../utils/wagmi-utils';

const UserDashboard = (props: { address: string; connector: Connector }) => {
    const address = props.address;
    const connector = props.connector;
    const contractFuncs = address && (getUserInfo(address) as any);
    const { data, isLoading, error } = useContractReads({
        contracts: contractFuncs,
    });

    const userInfo = data?.map((item) =>
        parseHexObject(item as HexResponse, true)
    );
    console.log(userInfo);
    const { disconnect } = useDisconnect();

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

    const stats = userInfo && (
        <StatGroup mb={5}>
            <Stat>
                <StatLabel>Released</StatLabel>
                <StatNumber>{userInfo[0]} FIL</StatNumber>
                <StatHelpText>Total Shares</StatHelpText>
            </Stat>
            <Stat>
                <StatLabel>Shares</StatLabel>
                <StatNumber> {userInfo[1]} FIL </StatNumber>
                <StatHelpText>Total Released</StatHelpText>
            </Stat>
            <Stat>
                <StatLabel>Releasable</StatLabel>
                <StatNumber> {userInfo[2]} FIL </StatNumber>
                <StatHelpText>Remaining Shares</StatHelpText>
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

                        <Button> Release Funds </Button>
                    </CardBody>
                </CardHeader>
            </Card>
        </Center>
    );
};
export default UserDashboard;
