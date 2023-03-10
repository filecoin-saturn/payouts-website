import { WarningIcon } from '@chakra-ui/icons';
import {
    Button,
    Heading,
    HStack,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
} from '@chakra-ui/react';
import React, { useState } from 'react';

import { InfoModalType } from '../types';

interface InfoModalProps {
    modalType: InfoModalType;
    title: string;
    message: string;
}

const InfoModal = (props: InfoModalProps) => {
    const [isOpen, setOpen] = useState<boolean>(true);

    let warningIconColor = 'grey.300';

    if (props.modalType === InfoModalType.warning) {
        warningIconColor = 'yellow.400';
    }

    if (props.modalType === InfoModalType.error) {
        warningIconColor = 'red.600';
    }

    return (
        <>
            <Modal size={'2xl'} isOpen={isOpen} onClose={() => setOpen(false)}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        <HStack>
                            <Heading size={'lg'}> {props.title} </Heading>
                            <WarningIcon w={8} h={8} color={warningIconColor} />
                        </HStack>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text fontSize={'xl'}>{props.message}</Text>
                    </ModalBody>

                    <ModalFooter>
                        <Button mr={3} onClick={() => setOpen(false)}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default InfoModal;
