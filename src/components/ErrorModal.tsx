import {
    Button,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    useDisclosure,
} from '@chakra-ui/react';

const ErrorModal = (props: Error) => {
    const { onOpen, onClose } = useDisclosure();

    return (
        <>
            <Modal isOpen onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Error</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody> {props.message} </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={onClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default ErrorModal;
