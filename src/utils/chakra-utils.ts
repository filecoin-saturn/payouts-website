import { extendTheme } from '@chakra-ui/react';

export const customTheme = extendTheme({
    colors: {
        saturn: {
            background: '#010024',
            component: '#05204d',
            button: '#237488',
            border: '#39C1CB99',
        },
    },
    components: {
        Text: {
            baseStyle: () => ({
                color: 'whiteAlpha.800',
            }),
        },
        Heading: {
            baseStyle: () => ({
                color: 'whiteAlpha.800',
            }),
        },
        Td: {
            baseStyle: () => ({
                color: 'whiteAlpha.800',
            }),
        },
        Table: {
            parts: ['th', 'td'],
            baseStyle: {
                color: 'whiteAlpha.800',
                th: {
                    borderColor: 'whiteAlpha.800',
                    color: 'whiteAlpha.800',
                },
                td: {
                    borderColor: 'whiteAlpha.800',
                    color: 'whiteAlpha.800',
                },
            },
        },
    },
});
