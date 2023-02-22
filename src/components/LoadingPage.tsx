import { Box, Center, Spinner } from '@chakra-ui/react';
// import { motion } from 'framer-motion';
// import { CiSatellite1 } from 'react-icons/ci';

const LoadingPage = () => {
    return (
        <Box h="100vh" w="100%">
            <Center h="100%">
                <Spinner size={'xl'} color="whiteAlpha.900" />
            </Center>

            {/* <motion.div
                className="box"
                animate={{
                    rotate: [0, 90, 180, 270, 360],
                }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    default: { ease: 'linear' },
                }}
            >
                <Box w="100px" h="100px" backgroundColor={'whiteAlpha.300'}>
                    <Icon
                        as={CiSatellite1}
                        color="whiteAlpha.800"
                        right="0"
                    />
                </Box>
            </motion.div> */}
        </Box>
    );
};

export default LoadingPage;
