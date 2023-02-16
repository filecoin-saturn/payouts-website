import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

const mockFuncs = {
    isMetaMaskConnected: vi.fn(() => Promise.resolve(true)),
    walletProvider: vi.fn(() => Promise.resolve({})),
    switchNetwork: vi.fn(() => Promise.resolve({})),
};
import FundRelease from '../src/components/FundRelease';
import { UserInfo } from '../src/types';
vi.mock('../src/utils/contract-utils', () => {
    return { ...mockFuncs };
});

describe('FundRelease component', () => {
    let userInfo: UserInfo;

    beforeEach(() => {
        userInfo = {
            address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
            releasable: '10',
            released: '20',
            shares: '30',
        };
    });

    it('should render a "Connect Wallet" button when the wallet is not connected', () => {
        render(<FundRelease {...userInfo} />);
        const connectWalletButton = screen.getByText(/Connect Wallet/i);
        expect(connectWalletButton).toBeInTheDocument();
    });

    it('should render a "Wallet Connected" button with a check icon when the wallet is connected', async () => {
        render(<FundRelease {...userInfo} />);
        const connectWalletButton = screen.getByText(/Connect Wallet/i);
        await act(async () => {
            await connectWalletButton.click();
        });
        const connectedWalletButton = screen.getByText(/Wallet Connected/i);
        expect(connectedWalletButton).toBeInTheDocument();
    });

    it('should render a "Release All Funds" button when the wallet is connected', async () => {
        render(<FundRelease {...userInfo} />);
        const connectWalletButton = screen.getByText(/Connect Wallet/i);
        await act(async () => {
            await connectWalletButton.click();
        });
        const releaseFundsButton = screen.getByText(/Release All Funds/i);
        expect(releaseFundsButton).toBeInTheDocument();
    });

    it('should render an error modal when an error occurs while releasing funds', async () => {
        render(<FundRelease {...userInfo} />);
        const connectWalletButton = screen.getByText(/Connect Wallet/i);
        await act(async () => {
            await connectWalletButton.click();
        });
        const releaseFundsButton = screen.getByText(/Release All Funds/i);
        await act(async () => {
            await releaseFundsButton.click();
        });
        const errorModal = screen.getByText(/Error/i);
        expect(errorModal).toBeInTheDocument();
    });

    it('should render user stats', async () => {
        render(<FundRelease {...userInfo} />);
        const shares = screen.getByText(/30 FIL/i);
        const released = screen.getByText(/20 FIL/i);
        const owed = screen.getByText(/10 FIL/i);
        expect(shares).toBeInTheDocument();
        expect(released).toBeInTheDocument();
        expect(owed).toBeInTheDocument();
    });
});
