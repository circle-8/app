import React from 'react'
import { TouchableOpacity } from 'react-native'
import MapView from 'react-native-maps'
import { Box, Center, Flex, Row, Text } from 'native-base'
import { FontAwesome } from '@expo/vector-icons'
import { colors } from '../../../constants/styles'
import * as Location from 'expo-location'
import { LoadingScreen } from '../../components/loading.component'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { MainRoutesParams } from '../../../constants/routes-reciclador'

type Coord = {
	latitude: number
	longitude: number
}

const latitudeDelta = 0.01
const longitudeDelta = 0.01

type Props = NativeStackScreenProps<MainRoutesParams, 'Home'>

export const HomeReciclador = ({ navigation }: Props) => {
	const [isLoading, setLoading] = React.useState(true)
	const [userCoords, setUserCoords] = React.useState<Coord>()

	const getUserLocation = async () => {
		const status = await Location.requestForegroundPermissionsAsync()
		if (status.granted) {
			const p = await Location.getCurrentPositionAsync()

			setUserCoords({
				latitude: p.coords.latitude,
				longitude: p.coords.longitude,
			})
			setLoading(false)
		}
	}

	/* Initial data loading */
	React.useEffect(() => {
		getUserLocation()
	}, [])

	if (isLoading) {
		return <LoadingScreen />
	}

	return (
		<SafeAreaView
			style={{ flex: 1, backgroundColor: colors.primary50 }}
			edges={['top']}
		>
			<Flex h="100%">
				<Box height="85%">
					<MapView
						style={{ width: '100%', height: '100%' }}
						showsUserLocation
						showsMyLocationButton
						initialRegion={{
							latitude: userCoords.latitude,
							longitude: userCoords.longitude,
							latitudeDelta,
							longitudeDelta,
						}}
					/>
				</Box>
				<Center height="15%" bgColor="white">
					<Row alignContent="center" mt="4">
						<Center w="33%">
							<TouchableOpacity onPress={() => console.log('not implemented')}>
								<FontAwesome
									name="recycle"
									size={40}
									color={colors.primary800}
								/>
							</TouchableOpacity>
							<Text fontSize="xs">Iniciar Recorrido</Text>
						</Center>
					</Row>
				</Center>
			</Flex>
		</SafeAreaView>
	)
}
