import { WarningIcon } from '@chakra-ui/icons';
import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Button,
    Code,
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

interface ErrorModalProps {
    error: Error;
    modalOpen: boolean;
}

const ErrorModal = (props: ErrorModalProps) => {
    const error = props.error;
    let errorCause = '';
    if (error.cause) {
        errorCause = error.cause as string;
    }

    return (
        <>
            <Modal
                isOpen={props.modalOpen}
                onClose={() => window.location.reload()}
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        <HStack>
                            <Heading size={'lg'}> Error </Heading>
                            <WarningIcon w={8} h={8} color={'red.600'} />
                        </HStack>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Accordion defaultIndex={[0]} allowMultiple>
                            <AccordionItem>
                                <h2>
                                    <AccordionButton>
                                        <Text>{error.message}</Text>
                                    </AccordionButton>
                                </h2>
                            </AccordionItem>

                            <AccordionItem>
                                <h2>
                                    <AccordionButton>
                                        View Original Message
                                        <AccordionIcon />
                                    </AccordionButton>
                                </h2>
                                <AccordionPanel pb={4}>
                                    <Code>{errorCause}</Code>
                                </AccordionPanel>
                            </AccordionItem>
                        </Accordion>
                    </ModalBody>

                    <ModalFooter>
                        <Button mr={3} onClick={() => window.location.reload()}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default ErrorModal;
