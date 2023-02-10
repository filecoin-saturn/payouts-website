import '@testing-library/jest-dom';

import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';

const mockFuncs = {
    readUserInfo: vi.fn(() =>
        Promise.resolve({ released: '5', shares: '10', releasable: '5' })
    ),
    getContract: vi.fn(() => Promise.resolve({})),
    isMetaMaskConnected: vi.fn(() => Promise.resolve(true)),
    walletProvider: vi.fn(() => Promise.resolve({})),
    switchNetwork: vi.fn(() => Promise.resolve({})),
};
import { describe, expect, it, vi } from 'vitest';

import WalletForm from '../src/components/WalletForm';
import { readUserInfo } from '../src/utils/contract-utils';

vi.mock('../src/utils/contract-utils', () => {
    return { ...mockFuncs };
});

describe('WalletForm', () => {
    it('renders the input form by default', () => {
        const { getByLabelText, getByText } = render(<WalletForm />);
        const input = getByLabelText('Wallet Address');
        const submitButton = getByText('Submit');

        expect(input).toBeInTheDocument();
        expect(submitButton).toBeInTheDocument();
    });

    it('updates the input value on change', () => {
        const { getByPlaceholderText } = render(<WalletForm />);
        const input = getByPlaceholderText('Filecoin Address');
        fireEvent.change(input, { target: { value: '0x123456' } });

        expect((input as HTMLInputElement).value).toBe('0x123456');
    });

    it('displays the user info when the form is submitted', async () => {
        const { getByPlaceholderText, getByText } = render(<WalletForm />);
        const input = getByPlaceholderText('Filecoin Address');
        const submitButton = getByText('Submit');

        fireEvent.change(input, { target: { value: '0x123456' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(readUserInfo).toHaveBeenCalled();
            expect(getByText('Shares')).toBeInTheDocument();
        });
    });

    it('displays an error modal if the request fails', async () => {
        //@ts-expect-error Error is required this test case
        mockFuncs.readUserInfo.mockImplementation(() => {
            return Promise.reject(new Error('error'));
        });
        const { getByPlaceholderText, getByText } = render(<WalletForm />);
        const input = getByPlaceholderText('Filecoin Address');
        const submitButton = getByText('Submit');

        fireEvent.change(input, { target: { value: '0x123456' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(readUserInfo).toHaveBeenCalled();
            expect(getByText('Error')).toBeInTheDocument();
        });
    });
});
