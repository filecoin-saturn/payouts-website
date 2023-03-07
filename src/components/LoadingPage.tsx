import { Box, Center, Icon, Spinner } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { BiPlanet } from 'react-icons/bi';
import { CiSatellite1 } from 'react-icons/ci';
const LoadingPage = () => {
    return (
        <Box h="100vh" w="100%">
            <Center h="100%">
                <Spinner size={'xl'} color="whiteAlpha.900" />

                {/* <Box position={'relative'} bottom="0" right="-140px">
                    <Icon
                        as={BiPlanet}
                        color="whiteAlpha.800"
                        w={'80px'}
                        h={'80px'}
                    />
                </Box> */}
                {/* <motion.div
                    className="box"
                    animate={{ rotate: [0, 180] }}
                    transition={{
                        repeatDelay: 1,
                        ease: 'easeInOut',
                        duration: 0.7,
                        repeat: Infinity,
                    }}
                >
                    <Box
                        position="relative"
                        w="200px"
                        h="200px"
                        // backgroundColor={'whiteAlpha.300'}
                    >
                        <Icon
                            as={CiSatellite1}
                            color="whiteAlpha.800"
                            right={'0'}
                            position="absolute"
                            transform={'rotate(180deg)'}
                            w={10}
                            h={10}
                        />

                        <Icon
                            as={CiSatellite1}
                            color="whiteAlpha.800"
                            right={'75'}
                            top={'-30'}
                            position="absolute"
                            transform={'rotate(140deg)'}
                            w={10}
                            h={10}
                        />

                        <Icon
                            as={CiSatellite1}
                            color="whiteAlpha.800"
                            right={'-30'}
                            bottom={'75'}
                            position="absolute"
                            transform={'rotate(45deg)'}
                            w={10}
                            h={10}
                        />

                        <Icon
                            as={CiSatellite1}
                            color="whiteAlpha.800"
                            left={'-30'}
                            bottom={'75'}
                            position="absolute"
                            transform={'rotate(45deg)'}
                            w={10}
                            h={10}
                        />
                        <Icon
                            as={CiSatellite1}
                            color="whiteAlpha.800"
                            right={'75'}
                            bottom={'-30'}
                            position="absolute"
                            transform={'rotate(-50deg)'}
                            w={10}
                            h={10}
                        />

                        <Icon
                            as={CiSatellite1}
                            color="whiteAlpha.800"
                            right={'0'}
                            bottom={'0'}
                            position="absolute"
                            transform={'rotate(-90deg)'}
                            w={10}
                            h={10}
                        />

                        <Icon
                            as={CiSatellite1}
                            color="whiteAlpha.800"
                            left={'0'}
                            top={'0'}
                            position="absolute"
                            transform={'rotate(90deg)'}
                            w={10}
                            h={10}
                        />

                        <Icon
                            as={CiSatellite1}
                            color="whiteAlpha.800"
                            left={'0'}
                            bottom={'0'}
                            position="absolute"
                            w={10}
                            h={10}
                        />
                    </Box>
                </motion.div> */}
            </Center>
        </Box>
    );
};

export default LoadingPage;
