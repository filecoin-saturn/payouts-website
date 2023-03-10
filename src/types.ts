export interface UserInfo {
    shares: string;
    releasable: string;
    released: string;
    address: string;
}

export enum ContractError {
    READ_CONTRACT = 'Error retrieving account info',
    TRANSACTION = 'Error performing transaction',
}

export enum InfoModalType {
    warning = 'warning',
    error = 'error',
    info = 'info',
}

export enum NetworkError {
    CONNECTION_ERROR = 'Failed to connect to network',
    ACCOUNT_ERROR = 'Failed to to connect to account',
}

export interface ProviderRpcError extends Error {
    message: string;
    code: number;
    data?: unknown;
}

export enum ProviderErrorCodes {
    CHAIN_DISCONNECTED = 4902,
}

export type DashboardContracts = Record<string, ContractItem>;
export interface ContractItem {
    address: string;
    funds: string;
    checked: boolean;
}
