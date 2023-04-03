import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import { WagmiConfig } from 'wagmi';

import { customTheme } from '../src/utils/chakra-utils';
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
    return (
        <React.StrictMode>
            <ChakraProvider theme={customTheme}>
                <PageContextProvider pageContext={pageContext}>
                    <WagmiConfig client={client}>{children}</WagmiConfig>
                </PageContextProvider>
            </ChakraProvider>
        </React.StrictMode>
    );
}
