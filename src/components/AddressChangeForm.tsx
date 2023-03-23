import { ArrowBackIcon, CheckIcon, EditIcon } from '@chakra-ui/icons';
import {
    Box,
    Button,
    ButtonGroup,
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
    Text,
} from '@chakra-ui/react';
import { validateAddressString } from '@glif/filecoin-address';
import { useState } from 'react';
import { FormEvent } from 'react';
import { Connector } from 'wagmi';

import { truncateEthAddress } from '../utils/wagmi-utils';

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

    if (userAddress && submitted) {
        const dashboardUrl = encodeURI(`dashboard/${userAddress}`);
        window.location.href = dashboardUrl;
    }

    const onAddressChange = (event: FormEvent<HTMLInputElement>) => {
        event.preventDefault();
        const address = event.currentTarget.value;

        if (validateAddressString(address)) {
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
                    Connected Wallet Address:{' '}
                    {truncateEthAddress(props.address)}
                </Heading>
                <Divider mb={4} />
                <Text fontSize={'xl'}>
                    You have successfully connected with your wallet! This
                    wallet will be used to sign and claim earnigns for your
                    filecoin address. Make sure you have funds in your wallet so
                    you can cover gas fees! If you desire to connect with a
                    different wallet then please select a different account from
                    your wallet provider. Otherwise, proceed to insert your
                    Filecoin Address that you will be claiming funds for.
                </Text>
            </ModalBody>
            <ModalFooter>
                <ButtonGroup spacing={4}>
                    <Button
                        leftIcon={<EditIcon />}
                        onClick={() => setChangeAddress(true)}
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
                <Text fontSize={'xl'} mb={4}>
                    Please insert the filecoin address that you will be claiming
                    for earnings for.
                </Text>
                <FormControl isRequired isInvalid={formValid === false}>
                    <FormLabel aria-label="Wallet Address">
                        Filecoin Address
                    </FormLabel>
                    <Input
                        onChange={onAddressChange}
                        placeholder="Filecoin Address"
                    />
                    {formValid === true ? (
                        <FormHelperText>
                            Enter a valid Filecoin address.
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

    return (
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
}

export default WalletForm;
