import {
    Box,
    Button,
    Card,
    CardBody,
    Center,
    FormControl,
    FormLabel,
    Input,
    Spinner,
} from '@chakra-ui/react';
import { Contract } from 'ethers';
import { isAddress } from 'ethers/lib/utils';
import { useEffect, useState } from 'react';
import { FormEvent } from 'react';

import ErrorModal from './components/ErrorModal';
import FundRelease from './components/FundRelease';
import { UserInfo } from './types';
import { getContract, readUserInfo } from './utils/contract-utils';
// 0xe058CfF7D4eA8B3d0B2682D7c76035988fb4A7b5

function App() {
    const [userAddress, setUserAddress] = useState<string>('');

    const [isLoading, setLoading] = useState<boolean>(false);
    const [userInfo, updateUserInfo] = useState<UserInfo | undefined>(
        undefined
    );

    const [error, updateErrorStatus] = useState<Error | undefined>(undefined);

    const onAddressChange = (event: FormEvent<HTMLInputElement>) => {
        event.preventDefault();
        const address = event.currentTarget.value;

        if (isAddress(address)) {
            return setUserAddress(address);
        }
        return;
    };

    const onAddressSubmit = async (event: FormEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setLoading(true);
        const contract: Contract = await getContract();

        const contractInfoRes = await readUserInfo(contract, userAddress);
        const info: UserInfo = {
            address: userAddress,
            ...contractInfoRes,
        };

        console.log(info);

        return updateUserInfo(info);
    };

    useEffect(() => {
        if (userInfo) {
            setLoading(false);
        }
    }, [userInfo]);

    const infoCard = userInfo && <FundRelease {...userInfo} />;

    const spinner = (
        <Spinner
            size={'xl'}
            position={'absolute'}
            alignSelf="center"
            marginTop="35"
        />
    );
    const renderSpinner = isLoading ? spinner : null;
    const errorModal = error ? <ErrorModal {...error} /> : null;

    const addressForm = (
        <Card variant={'outline'} padding={'2%'}>
            {errorModal}
            <CardBody filter="auto" blur={renderSpinner ? '2px' : 'none'}>
                <Box width={'md'}>
                    <FormControl isRequired>
                        <FormLabel> Wallet Address</FormLabel>
                        <Input
                            onChange={onAddressChange}
                            placeholder="Filecoin Address"
                        />
                    </FormControl>

                    <Button mt={4} type="submit" onClick={onAddressSubmit}>
                        Submit
                    </Button>
                </Box>
            </CardBody>
            {renderSpinner}
        </Card>
    );

    const render = userInfo ? infoCard : addressForm;

    return (
        <Box w={'100%'} h={'100vh'} backgroundColor={'gray.900'}>
            <Center w={'100%'} h={'100%'}>
                {render}
            </Center>
        </Box>
    );
}

export default App;
