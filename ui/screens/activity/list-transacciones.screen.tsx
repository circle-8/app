import React from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ActivityRouteParams, ActivityRoutes } from '../../../constants/routes'
import {
	HStack,
	ScrollView,
	View,
	Text,
	WarningOutlineIcon,
	Card,
} from 'native-base'
import { match } from '../../../utils/either'
import { TransaccionService } from '../../../services/transaccion.service'
import { LoadingScreen } from '../../components/loading.component'
import { Transaccion } from '../../../services/types'
import { formatFecha } from '../../../utils/days'
import { TouchableOpacity } from 'react-native'

type Props = NativeStackScreenProps<ActivityRouteParams, 'ListTransacciones'>

export const ListTransacciones = ({ navigation, route }: Props) => {
	const { ciudadanoId } = route.params
	const [isLoading, setLoading] = React.useState(true)
	const [transactions, setTransactions] = React.useState<Transaccion[]>([])

	const loadData = async () => {
		const userTransactions = await TransaccionService.getAll({
			ciudadanoId,
		})
		match(
			userTransactions,
			t => setTransactions(t),
			e => setTransactions([]),
		)
		setLoading(false)
	}

	React.useEffect(() => {
		loadData()
	}, [])

	if (isLoading) return <LoadingScreen />

	return (
		<ScrollView alignContent="center">
			{transactions && transactions.length > 0 ? (
				transactions.map((transaction, idx) => (
					<>
						<TouchableOpacity
							key={`userT-${idx}`}
							onPress={() =>
								navigation.navigate(ActivityRoutes.viewTransaccion, {
									ciudadanoId,
									transaccionId: transaction.id,
								})
							}
						>
							<Card key={`box-${idx}`} mb={2} p={2}>
								<HStack
									space={2}
									mt="0.5"
									key={`stack-${idx}`}
									alignItems="center"
								>
									<Text fontSize="sm">Transaccion #{transaction.id}</Text>
								</HStack>
								<HStack
									space={2}
									mt="0.5"
									key={`name-${idx}`}
									alignItems="center"
								>
									<Text fontSize="sm" numberOfLines={4}>
										Punto de reciclaje {transaction.puntoReciclajeId}
									</Text>
								</HStack>
								<HStack
									space={2}
									mt="0.5"
									key={`date-${idx}`}
									alignItems="center"
								>
									<Text fontSize="sm" numberOfLines={4}>
										{formatFecha(transaction.fechaCreacion, true)}
									</Text>
								</HStack>
								<HStack
									space={2}
									mt="0.5"
									key={`date-retiro-${idx}`}
									alignItems="center"
								>
									<Text fontSize="sm" numberOfLines={4}>
										{transaction.fechaRetiro && 'Ya completada'}
									</Text>
								</HStack>
							</Card>
						</TouchableOpacity>
					</>
				))
			) : (
				<>
					<View
						style={{
							flex: 1,
							justifyContent: 'center',
							alignItems: 'center',
						}}
					>
						<WarningOutlineIcon size={5} color="red.600" />
						<Text style={{ fontSize: 14, textAlign: 'center' }}>
							No dispones de transacciones abiertas
						</Text>
					</View>
				</>
			)}
		</ScrollView>
	)
}
