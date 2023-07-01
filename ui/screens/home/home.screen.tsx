import React from 'react'
import MapView from 'react-native-maps'
import { Box, Center, Flex, Row, Text } from 'native-base'
import Ionicons from '@expo/vector-icons/Ionicons'
import { FontAwesome } from '@expo/vector-icons'
import { colors } from '../../../constants/styles'
import * as Location from 'expo-location'
import { LoadingScreen } from '../../components/loading.component'
import { Http } from '../../../api/api'

type Coord = {
	latitude: number
	longitude: number
}

const latitudeDelta = 0.01
const longitudeDelta = 0.01

export const Home = () => {
	const [isLoading, setLoading] = React.useState(true)
	const [userCoords, setUserCoords] = React.useState<Coord>()

	React.useEffect(() => {
		(async () => {
			const status = await Location.requestForegroundPermissionsAsync()
			if (status.granted) {
				const p = await Location.getCurrentPositionAsync()

				setUserCoords({
					latitude: p.coords.latitude,
					longitude: p.coords.longitude
				})
				setLoading(false)
			}
			// TODO: que hacer si no da permisos (no funcionar, por ejemplo)
		})()
	}, [])

	if (isLoading) {
		return <LoadingScreen />
	}

	return (
		<Flex h="100%" safeArea>
			<Box height="85%">
				<MapView
					style={{ width: '100%', height: '100%' }}
					showsUserLocation
					showsMyLocationButton
					initialRegion={{
						latitude: userCoords.latitude,
						longitude: userCoords.longitude,
						latitudeDelta,
						longitudeDelta
					}}
				/>
			</Box>
			<Center height="15%" bgColor="white">
				<Row alignContent="center" mt="4">
					<Center w="33%">
						<FontAwesome name="recycle" size={40} color={colors.primary800} />
						<Text fontSize="xs">Retirar residuos</Text>
					</Center>
					<Center w="33%">
						<Ionicons name="trash" size={40} color={colors.primary800} />
						<Text fontSize="xs">Entregar residuos</Text>
					</Center>
					<Center w="33%">
						<Ionicons name="leaf" size={40} color={colors.primary800} />
						<Text fontSize="xs">Circuitos de Reciclaje</Text>
					</Center>
				</Row>
			</Center>
		</Flex>
	)
}
