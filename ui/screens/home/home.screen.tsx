import React from 'react'
import MapView from 'react-native-maps'
import { Box, Center, Flex, Row, Text } from 'native-base'
import Ionicons from '@expo/vector-icons/Ionicons'
import { FontAwesome } from '@expo/vector-icons'

export const Home = () => {
	return (
		<Flex h="100%">
			<Box height="80%">
				<MapView style={{ width: '100%', height: '100%' }} />
			</Box>
			<Center height="20%" bgColor="white">
				<Row alignContent="center" mt="4">
					<Center w="33%">
						<FontAwesome name="recycle" size={40} />
						<Text fontSize="xs">Retirar residuos</Text>
					</Center>
					<Center w="33%">
						<Ionicons name="trash" size={40} />
						<Text fontSize="xs">Entregar residuos</Text>
					</Center>
					<Center w="33%">
						<Ionicons name="leaf" size={40} />
						<Text fontSize="xs">Circuitos de Reciclaje</Text>
					</Center>
				</Row>
			</Center>
		</Flex>
	)
}
