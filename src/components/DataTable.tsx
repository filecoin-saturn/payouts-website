import {
    Checkbox,
    Table,
    TableCaption,
    TableContainer,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
} from '@chakra-ui/react';
import { useState } from 'react';

import { truncateEthAddress } from '../utils/wagmi-utils';

const DataTable = (props: { contracts?: any }) => {
    const [contracts, setContracts] = useState(props.contracts);

    const allChecked = Object.values(contracts).every(
        (contract: any) => contract.checked
    );
    const isIndeterminate =
        Object.values(contracts).some((contract: any) => contract.checked) &&
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
    const tableRows =
        contracts &&
        Object.keys(contracts).map((address) => {
            const contract = contracts[address];
            return (
                <Tr key={address}>
                    <Td>
                        {' '}
                        <Checkbox
                            isChecked={contract.checked}
                            onChange={() => changeState(address)}
                        ></Checkbox>
                    </Td>
                    <Td>{truncateEthAddress(address)}</Td>
                    <Td isNumeric>{contract.funds}</Td>
                </Tr>
            );
        });

    return (
        <TableContainer
            mt={5}
            rounded="md"
            borderColor="gray.200"
            borderWidth="1px"
        >
            <Table variant="striped">
                <TableCaption>Contract Selection</TableCaption>
                <Thead>
                    <Tr>
                        <Th alignContent={'center'}>
                            <Checkbox
                                isChecked={allChecked}
                                isIndeterminate={isIndeterminate}
                                onChange={(e) => selectAll()}
                            >
                                Selected
                            </Checkbox>
                        </Th>
                        <Th>Contract Address</Th>
                        <Th isNumeric>Funds Available </Th>
                    </Tr>
                </Thead>
                <Tbody>{tableRows}</Tbody>
            </Table>
        </TableContainer>
    );
};

export default DataTable;
