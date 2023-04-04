import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import { WagmiConfig } from 'wagmi';

import { client } from '../src/utils/wagmi-utils';
import type { PageContext } from './types';
import { PageContextProvider } from './usePageContext';
export { PageShell };

function PageShell({
    children,
    pageContext,
}: {
    children: React.ReactNode;
    pageContext: PageContext;
}) {
    console.log(client);
    return (
        <React.StrictMode>
            <WagmiConfig client={client}>
                <ChakraProvider>
                    <PageContextProvider pageContext={pageContext}>
                        {children}
                    </PageContextProvider>
                </ChakraProvider>
            </WagmiConfig>
        </React.StrictMode>
    );
}
