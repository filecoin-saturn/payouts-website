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

import { UserInfo } from '../types';
import { getContract, readUserInfo } from '../utils/contract-utils';
import FundRelease from './FundRelease';
import ErrorModal from './Modals/ErrorModal';

function WalletForm() {
    const [userAddress, setUserAddress] = useState<string>('');

    const [isLoading, setLoading] = useState<boolean>(false);
    const [userInfo, updateUserInfo] = useState<UserInfo | undefined>(
        undefined
    );

    const [error, setErrorState] = useState<Error | undefined>(undefined);

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
        try {
            const contractInfoRes = await readUserInfo(contract, userAddress);
            const info: UserInfo = {
                address: userAddress,
                ...contractInfoRes,
            };
            updateUserInfo(info);
        } catch (error) {
            if (error instanceof Error) {
                setErrorState(error);
            }
        }
        return;
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
    const errorModal = error ? <ErrorModal error={error} modalOpen /> : null;

    const addressForm = (
        <Card variant={'outline'} padding={'2%'}>
            {errorModal}
            <CardBody filter="auto" blur={renderSpinner ? '2px' : 'none'}>
                <Box width={'md'}>
                    <FormControl isRequired>
                        <FormLabel aria-label="Wallet Address">
                            Wallet Address
                        </FormLabel>
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

export default WalletForm;
