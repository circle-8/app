import React from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ActivityRouteParams } from '../../../constants/routes'
import {
	HStack,
	ScrollView,
	View,
	Text,
	useToast,
	Row,
	Column,
	Center,
	AlertDialog,
	Button,
	Box,
	WarningOutlineIcon,
} from 'native-base'
import { caseMaybe, match } from '../../../utils/either'
import { TransaccionService } from '../../../services/transaccion.service'
import { LoadingScreen } from '../../components/loading.component'
import { Transaccion } from '../../../services/types'
import { TouchableOpacity, Image } from 'react-native'
import { ResiduoService } from '../../../services/residuo.service'
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons'

type Props = NativeStackScreenProps<ActivityRouteParams, 'ViewTransaccion'>

export const ViewTransaccion = ({ navigation, route }: Props) => {
	const { ciudadanoId, transaccionId } = route.params
	const [isLoading, setLoading] = React.useState(true)
	const [transaction, setTransaction] = React.useState<Transaccion>()
	const [selectedResiduo, setSelectedResiduo] = React.useState<number>()
	const [selectedAction, setSelectedAction] = React.useState<ActionType>()
	const [viewImage, setViewImage] = React.useState(false)

	const toast = useToast()

	const loadData = async () => {
		const transaction = await TransaccionService.get(transaccionId)
		match(
			transaction,
			t => {
				setTransaction(t)
			},
			err => {
				toast.show({ description: err })
				navigation.goBack()
			},
		)
		setLoading(false)
	}

	const reload = () => {
		setLoading(true)
		loadData()
	}

	const closeAlert = () => {
		setSelectedResiduo(undefined)
		setSelectedAction(undefined)
	}

	const verFoto = () => {
		setViewImage(!viewImage)
	}

	React.useEffect(() => {
		loadData()
	}, [])

	if (isLoading) return <LoadingScreen />

	return (
		<ScrollView contentContainerStyle={{ alignItems: 'center', paddingTop: 5 }}>
			<Text fontSize="xs" fontWeight="bold" textAlign="center" mb={2} mt={4} width={"80%"}>
				Aqui encontras todos los residuos que agregaste a esta transaccion,
				podras completar la transaccion una vez que los residuos hayan sido retirados.
			</Text>
			<Center w="100%" mt="2">
				{transaction.residuos &&
					transaction.residuos.map(ResiduoService.mapResponse).map((r, idx) => (
						<React.Fragment key={`transaction-${idx}`}>
							<Box
								key={`box-${idx}`}
								p={2}
								borderWidth={1}
								borderColor="gray.300"
								borderRadius="md"
								shadow={1}
								maxWidth={500}
								bg={'white'}
								width="80%"
								marginBottom={2}
							>
								<Row>
									<Column width="80%">
										<HStack
											space={2}
											mt="0.5"
											key={`stack-${idx}`}
											alignItems="center"
										>
											<Text fontSize="sm">Residuo  <Text fontSize="sm" fontWeight="bold">#{r.id}</Text></Text>
										</HStack>
										<HStack
											space={2}
											mt="0.5"
											key={`name-${idx}`}
											alignItems="center"
										>
											<Text fontSize="sm" numberOfLines={4}>
												{r.tipoResiduo.nombre}
											</Text>
										</HStack>
										<HStack
											space={2}
											mt="0.5"
											key={`desc-${idx}`}
											alignItems="center"
										>
											<Text fontSize="sm" numberOfLines={25}>
												{r.descripcion}
											</Text>
										</HStack>
										<HStack
											space={2}
											mt="0.5"
											key={`date-${idx}`}
											alignItems="center"
										>
											<Text fontSize="sm" numberOfLines={4} fontWeight="bold">
												{r.fechaRetiro
													? 'Ya ha sido retirado'
													: 'Todavia no ha sido retirado'}
											</Text>
										</HStack>
									</Column>
									<Center flex="1">
										<Column space="3">
											{!r.fechaRetiro && (
												<TouchableOpacity
													onPress={() => {
														setSelectedResiduo(r.id)
														setSelectedAction('DELETE')
													}} >
												<FontAwesome name="trash" size={28} alignSelf="center" />
											</TouchableOpacity>
											)}
										</Column>
									</Center>
								</Row>
								{r.base64 && (
									<>
										<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', }} >
											<View style={{ padding: 5, marginLeft: 15 }}>
												<TouchableOpacity onPress={verFoto}>
													<FontAwesome5 name="image" size={28} alignSelf="center" />
													<Text textAlign="center" style={{ fontSize: 7 }} numberOfLines={4} fontWeight="bold" color="#41483F">
														{viewImage ? 'Ocultar foto' : 'Ver foto'}
													</Text>
												</TouchableOpacity>
											</View>
											{viewImage && (
												<View style={{ borderWidth: 2, borderColor: 'green', padding: 5, marginLeft: 15, borderRadius: 5 }}>
													<Image source={{ uri: 'data:image/jpeg;base64,' + r.base64 }} style={{ width: 200, height: 200 }} />
												</View>
											)}
										</View>
									</>
								)}
							</Box>
						</React.Fragment>
					))}
					{ !transaction.residuos && (
						<View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 4, maxWidth: '85%' }}>
								<WarningOutlineIcon size={5} color="red.600" />
								<Text style={{ fontSize: 14, textAlign: 'center' }}>
									Esta transaccion no dispone de residuos, podes agregarlos desde tus solicitudes.
								</Text>
							</View>
					)}
				{transaction.residuos &&
					transaction.residuos.length > 0 &&
					transaction.residuos.filter(r => !r.fechaRetiro).length == 0 && !transaction.transporteId && (
						<Button
							width="80%"
							mt="4"
							onPress={async () => {
								const res = await TransaccionService.fulfill(transaccionId)
								match(
									res,
									p => {
										toast.show({
											description: 'Transaccion completada exitosamente',
										})
										navigation.goBack()
									},
									err => {
										toast.show({ description: err })
										navigation.goBack()
									},
								)
							}}
						>
							Completar Transaccion
						</Button>
					)}
				<AlertBeforeAction
					isOpen={selectedResiduo && selectedAction === 'DELETE'}
					action={'DELETE'}
					onCancel={closeAlert}
					onOk={async () => {
						const error = await TransaccionService.deleteResiduo(
							transaccionId,
							selectedResiduo,
						)
						caseMaybe(
							error,
							err => toast.show({ description: err }),
							() => toast.show({ description: '¡Residuo eliminado!' }),
						)
						closeAlert()
						reload()
					}}
				/>
			</Center>
		</ScrollView>
	)
}

type ActionType = 'DELETE'
type AlertProps = {
	isOpen: boolean
	action: ActionType
	onCancel: () => void
	onOk: () => void
}
const AlertBeforeAction = ({ isOpen, action, onCancel, onOk }: AlertProps) => {
	const cancelRef = React.useRef(null)
	const title =
		action === 'DELETE' ? 'Eliminar residuo' : 'Marcar residuo como retirado'
	const body =
		action === 'DELETE'
			? 'Esto va a eliminar el residuo, y no podrá ser retirado'
			: 'Esto marcará el residuo como retirado y no podrá volver a ser retirado'
	return (
		<AlertDialog
			leastDestructiveRef={cancelRef}
			isOpen={isOpen}
			onClose={onCancel}
		>
			<AlertDialog.Content>
				<AlertDialog.CloseButton />
				<AlertDialog.Header>{title}</AlertDialog.Header>
				<AlertDialog.Body>{body}</AlertDialog.Body>
				<AlertDialog.Footer>
					<Button.Group space={2}>
						<Button onPress={onCancel} ref={cancelRef}>
							Cancelar
						</Button>
						<Button
							colorScheme={action === 'DELETE' ? 'danger' : 'primary'}
							onPress={onOk}
						>
							{action === 'DELETE' ? 'Eliminar' : 'Marcar Retirado'}
						</Button>
					</Button.Group>
				</AlertDialog.Footer>
			</AlertDialog.Content>
		</AlertDialog>
	)
}
