import { ArrowBackIcon, CheckIcon, EditIcon } from '@chakra-ui/icons';
import {
    Box,
    Button,
    ButtonGroup,
    Center,
    Divider,
    FormControl,
    FormErrorMessage,
    FormHelperText,
    FormLabel,
    Heading,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spinner,
    Text,
} from '@chakra-ui/react';
import { isAddress } from 'ethers/lib/utils';
import { useState } from 'react';
import { FormEvent } from 'react';
import { Connector } from 'wagmi';

import { truncateEthAddress } from '../utils/wagmi-utils';
import UserDashboard from './Dashboard';

// 0xe058CfF7D4eA8B3d0B2682D7c76035988fb4A7b5

function WalletForm(props: { address: string; connector: Connector }) {
    const [userAddress, setUserAddress] = useState<string | undefined>(
        undefined
    );

    const [changeAddress, setChangeAddress] = useState<boolean>(false);
    const [formValid, setFormValidation] = useState<boolean | undefined>(
        undefined
    );

    const [submitted, setSubmitted] = useState<boolean>(false);

    const onAddressChange = (event: FormEvent<HTMLInputElement>) => {
        event.preventDefault();
        const address = event.currentTarget.value;

        if (isAddress(address)) {
            setFormValidation(true);
            setUserAddress(address);
            return;
        }
        setFormValidation(false);
        return;
    };

    const selectionButtonGroup = (
        <>
            <ModalBody>
                <Heading size="lg" m={4}>
                    Selected Address: {truncateEthAddress(props.address)}
                </Heading>
                <Divider mb={4} />
                <Text fontSize={'xl'}>
                    Please confirm your Saturn Node operator address. To change
                    the address, you can either select a different address from
                    your browser wallet or manually insert one.
                </Text>
                <Text fontSize={'xl'}>
                    If you are depositing into an exchange wallet, insert the
                    exchange manually by clicking on &quot;Change Address&quot;.
                </Text>
            </ModalBody>
            <ModalFooter>
                <ButtonGroup spacing={4}>
                    <Button
                        leftIcon={<EditIcon />}
                        onClick={() => setChangeAddress(true)}
                    >
                        Change Address
                    </Button>
                    <Button
                        leftIcon={<CheckIcon />}
                        onClick={() => {
                            setUserAddress(props.address);
                            setSubmitted(true);
                        }}
                    >
                        Proceed
                    </Button>
                </ButtonGroup>
            </ModalFooter>
        </>
    );

    const addressSubmitForm = (
        <>
            <ModalBody>
                <FormControl isRequired isInvalid={formValid === false}>
                    <FormLabel aria-label="Wallet Address">
                        Wallet Address
                    </FormLabel>
                    <Input
                        onChange={onAddressChange}
                        placeholder="Ethereum Address"
                    />
                    {formValid === true ? (
                        <FormHelperText>
                            Enter a valid Ethereum address.
                        </FormHelperText>
                    ) : (
                        <FormErrorMessage>
                            Inserted address is not valid
                        </FormErrorMessage>
                    )}
                </FormControl>
            </ModalBody>
            <ModalFooter>
                <ButtonGroup>
                    <Button
                        mt={4}
                        type="submit"
                        leftIcon={<ArrowBackIcon />}
                        onClick={() => {
                            setChangeAddress(false);
                            setFormValidation(undefined);
                        }}
                    >
                        Back
                    </Button>

                    <Button
                        leftIcon={<CheckIcon />}
                        mt={4}
                        isDisabled={!userAddress}
                        type="submit"
                        onClick={() => setSubmitted(true)}
                    >
                        Submit
                    </Button>
                </ButtonGroup>
            </ModalFooter>
        </>
    );

    const addressForm = (
        <Modal isOpen size={'4xl'} onClose={() => console.log('form close')}>
            <ModalOverlay />
            <ModalContent padding={5}>
                <ModalHeader padding={3}>
                    <Heading textAlign="center" size="2xl">
                        Confirm Address
                    </Heading>
                </ModalHeader>
                {changeAddress ? addressSubmitForm : selectionButtonGroup}
                <Box width={'md'}></Box>
            </ModalContent>
        </Modal>
    );

    const render =
        submitted && userAddress ? (
            <UserDashboard address={userAddress} connector={props.connector} />
        ) : (
            addressForm
        );

    return <>{render}</>;
}

export default WalletForm;
