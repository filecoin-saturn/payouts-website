import {
    Badge,
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
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
    useContractWrite,
    UseContractWriteConfig,
    usePrepareContractWrite,
    useWaitForTransaction,
} from 'wagmi';

import {
    ContractError,
    ContractItem,
    DashboardContracts,
    PendingTransaction,
} from '../types';
import {
    factoryContract,
    formatAddressForContract,
    truncateEthAddress,
} from '../utils/wagmi-utils';

const LOCAL_STORAGE_ID = 'saturnTransactionHashes';

const DataTable = (props: {
    contracts: DashboardContracts;
    releasedContracts: DashboardContracts;
    address: string;
    allPendingHash: string | null;
    zeroFunds: boolean;
    setDashboardTxLoading: Dispatch<SetStateAction<boolean>>;
}) => {
    const [contracts, setContracts] = useState(props.contracts);
    const [txLoading, setTxLoading] = useState<boolean>(false);
    const [pendingTransactions, setPendingTransactions] = useState<
        Array<PendingTransaction>
    >([]);

    useEffect(() => {
        if (props.allPendingHash) {
            addPendingTransaction(props.allPendingHash, true);
        }
    }, [props.allPendingHash]);

    useEffect(() => {
        setContracts({ ...props.contracts });

        const newContracts = props.contracts;
        const cachedTransactions = localStorage.getItem(LOCAL_STORAGE_ID);
        if (cachedTransactions) {
            const parsedCachedTransactions: Array<PendingTransaction> =
                JSON.parse(cachedTransactions);
            parsedCachedTransactions.forEach((transaction) => {
                const contract = newContracts[transaction.contractAddress];
                if (contract) contract.pending = true;
            });
            setContracts({ ...newContracts });
            setPendingTransactions(JSON.parse(cachedTransactions));
        }
    }, [props.contracts]);

    const transactionToWatch =
        pendingTransactions[0] && pendingTransactions[0].hash;
    const { data, isError } = useWaitForTransaction({
        hash: transactionToWatch as any,
        onSettled(data, error) {
            if (error) {
                let cause;
                if (error instanceof Error) {
                    cause = error.message;
                }
                throw new Error(ContractError.TRANSACTION, {
                    cause,
                });
            }
            clearPendingTransaction(transactionToWatch);
        },
    });

    const setDashboardTxLoading = props.setDashboardTxLoading;

    const addPendingTransaction = (
        transactionHash: string,
        allContracts = false
    ) => {
        let contractsToAdd = selectedContracts;
        if (allContracts) {
            contractsToAdd = Object.values(contracts);
        }
        const pendingTransactionList = contractsToAdd.map((contract) => {
            return {
                hash: transactionHash,
                contractAddress: contract.address,
            };
        });
        const newPendingTransactions = [
            ...pendingTransactions,
            ...pendingTransactionList,
        ];
        setPendingTransactions(newPendingTransactions);
        localStorage.setItem(
            LOCAL_STORAGE_ID,
            JSON.stringify(newPendingTransactions)
        );
        Object.values(contracts).forEach((contract) => {
            if (contract.checked) {
                contract.pending = true;
            }
        });

        setContracts({ ...contracts });
    };

    const clearPendingTransaction = (transactionHash: string) => {
        const newPendingTransactions = pendingTransactions.filter(
            (transaction) => !(transaction.hash == transactionHash)
        );
        setPendingTransactions(newPendingTransactions);
        localStorage.setItem(
            LOCAL_STORAGE_ID,
            JSON.stringify(newPendingTransactions)
        );
    };

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
    const pendingContracts =
        contracts &&
        Object.values(contracts).filter((item: ContractItem) => item.pending);

    const writeArgs = [
        formatAddressForContract(props.address),
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
            const transactionHash = data?.hash;
            transactionHash && addPendingTransaction(transactionHash);
            setDashboardTxLoading(false);
            setTxLoading(false);

            try {
                await data?.wait();
                transactionHash && clearPendingTransaction(transactionHash);
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
            setDashboardTxLoading(true);
            write();
        }
    };

    const releasableTableRows = Object.values(contracts).map((contract) => {
        return (
            !contract.pending && (
                <Tr key={contract.address}>
                    <Td>
                        {' '}
                        <Checkbox
                            size={'lg'}
                            isChecked={contract.checked}
                            isDisabled={props.zeroFunds || contract.pending}
                            onChange={() => changeState(contract.address)}
                        ></Checkbox>
                    </Td>
                    <Td>
                        {truncateEthAddress(contract.address)}{' '}
                        {contract.pending.toString()}
                    </Td>
                    <Td isNumeric>{contract.funds}</Td>
                </Tr>
            )
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
                            isDisabled={props.zeroFunds}
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

    const releasedBadge = (
        <Badge variant="subtle" colorScheme="green">
            released
        </Badge>
    );
    const pendingBadge = (
        <Badge variant="subtle" colorScheme="purple">
            pending ...
        </Badge>
    );
    const releasedTableRows = Object.values(releasedContracts).map(
        (contract) => {
            return (
                <Tr key={contract.address}>
                    <Td>{truncateEthAddress(contract.address)}</Td>
                    <Td> {releasedBadge} </Td>
                    <Td isNumeric>{contract.funds}</Td>
                </Tr>
            );
        }
    );

    const pendingContractRows = pendingContracts.map((contract) => {
        return (
            <Tr key={contract.address}>
                <Td>{truncateEthAddress(contract.address)}</Td>
                <Td> {pendingBadge} </Td>
                <Td isNumeric>{contract.funds}</Td>
            </Tr>
        );
    });

    const releasedContractsTable = (
        <Table variant="striped">
            <Thead>
                <Tr>
                    <Th>Contract Address</Th>
                    <Th> Status </Th>
                    <Th isNumeric>Funds Released </Th>
                </Tr>
            </Thead>
            <Tbody>
                <>
                    {pendingContractRows}
                    {releasedTableRows}
                </>
            </Tbody>
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
