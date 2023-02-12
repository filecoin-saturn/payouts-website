import { useContractReads } from 'wagmi';

import { getUserInfo } from '../utils/contract-utils2';

interface ContractProps {
    address: string;
}

function Contract(props: ContractProps) {
    const userAddress = props.address;
    const contractReads = getUserInfo(userAddress);
    const { data, isError, isLoading } = useContractReads({
        contracts: contractReads,
    });

    console.log(data);

    return <div>Hello</div>;
}

export default Contract;
