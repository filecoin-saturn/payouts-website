export interface UserInfo {
    shares: string;
    releasable: string;
    released: string;
    address: string;
}

export enum ContractErrorMessage {
    READ_CONTRACT = 'Error retrieving account info',
    TRANSACTION = 'Error performing transaction',
}
