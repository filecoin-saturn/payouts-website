import {
    Button,
    Checkbox,
    Heading,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Tfoot,
    Th,
    Thead,
    Tr,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import {
    useContractWrite,
    UseContractWriteConfig,
    usePrepareContractWrite,
} from 'wagmi';

import { ContractError, ContractItem, DashboardContracts } from '../types';
import { factoryContract, truncateEthAddress } from '../utils/wagmi-utils';

const DataTable = (props: {
    contracts: DashboardContracts;
    releasedContracts: DashboardContracts;
    address: string;
}) => {
    const [contracts, setContracts] = useState(props.contracts);
    const [txLoading, setTxLoading] = useState(false);

    useEffect(() => {
        setContracts({ ...props.contracts });
    }, [props.contracts]);

    const allChecked =
        contracts &&
        Object.values(contracts).every(
            (contract: ContractItem) => contract.checked
        );
    const isIndeterminate =
        contracts &&
        Object.values(contracts).some(
            (contract: ContractItem) => contract.checked
        ) &&
        !allChecked;
    const changeState = (address: string) => {
        const newState = !contracts[address].checked;
        contracts[address].checked = newState;
        setContracts({
            ...contracts,
        });
    };

    const selectAll = () => {
        Object.keys(contracts).forEach((address) => {
            contracts[address].checked = !allChecked;
        });

        setContracts({ ...contracts });
    };

    const selectedContracts =
        contracts &&
        Object.values(contracts).filter((item: ContractItem) => item.checked);
    const writeArgs = [
        props.address,
        selectedContracts.map((item: ContractItem) => item.address),
    ];

    const { config } = usePrepareContractWrite({
        ...factoryContract,
        functionName: 'releaseSelect',
        args: writeArgs,
    });

    const { write } = useContractWrite({
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

    const releasableTableRows = Object.keys(contracts).map((address) => {
        const contract = contracts[address];
        return (
            <Tr key={address}>
                <Td>
                    {' '}
                    <Checkbox
                        size={'lg'}
                        isChecked={contract.checked}
                        onChange={() => changeState(address)}
                    ></Checkbox>
                </Td>
                <Td>{truncateEthAddress(address)}</Td>
                <Td isNumeric>{contract.funds}</Td>
            </Tr>
        );
    });

    const contractsTable = (
        <Table variant="striped">
            <Thead>
                <Tr>
                    <Th alignContent={'center'}>
                        <Checkbox
                            size="lg"
                            isChecked={allChecked}
                            isIndeterminate={isIndeterminate}
                            onChange={() => selectAll()}
                        >
                            Selected
                        </Checkbox>
                    </Th>
                    <Th>Contract Address</Th>
                    <Th isNumeric>Funds Available </Th>
                </Tr>
            </Thead>
            <Tbody>{releasableTableRows}</Tbody>

            <Tfoot>
                <Tr>
                    <Td />
                    <Td />
                    <Td>
                        <Button
                            isDisabled={!allChecked && !isIndeterminate}
                            onClick={() => writeContract()}
                            isLoading={txLoading}
                            float="right"
                            loadingText="Sending Transactions"
                            mt={4}
                        >
                            Release Selected
                        </Button>
                    </Td>
                </Tr>
            </Tfoot>
        </Table>
    );
    const releasedContracts = props.releasedContracts;
    const releasedTableRows = Object.keys(releasedContracts).map((address) => {
        const contract = releasedContracts[address];
        return (
            <Tr key={address}>
                <Td>{truncateEthAddress(address)}</Td>
                <Td isNumeric>{contract.funds}</Td>
            </Tr>
        );
    });

    const releasedContractsTable = (
        <Table variant="striped">
            <Thead>
                <Tr>
                    <Th>Contract Address</Th>
                    <Th isNumeric>Funds Released </Th>
                </Tr>
            </Thead>
            <Tbody>{releasedTableRows}</Tbody>
        </Table>
    );

    const isContracts = Object.keys(contracts).length > 0;
    const isReleasedContracts = Object.keys(releasedContracts).length > 0;
    const noRowsText = (
        <Text mt={5} mb={5} textAlign="center" color="gray.400">
            No funds available to show
        </Text>
    );
    return (
        <TableContainer
            width={'100%'}
            mt={5}
            rounded="md"
            borderColor="gray.200"
            borderWidth="1px"
            padding={2}
        >
            <Heading m={3} size="md">
                Claimable Transactions
            </Heading>
            {isContracts ? contractsTable : noRowsText}
            <Heading m={3} mt={8} size="md">
                Transaction History
            </Heading>
            {isReleasedContracts ? releasedContractsTable : noRowsText}
        </TableContainer>
    );
};

export default DataTable;
