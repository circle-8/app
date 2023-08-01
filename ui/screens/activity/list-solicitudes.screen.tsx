import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React from 'react'
import { ActivityRouteParams } from '../../../constants/routes'
import {
	Box,
	Button,
	Center,
	HStack,
	ScrollView,
	View,
	useToast,
	Text,
	WarningOutlineIcon,
	DeleteIcon,
	InfoOutlineIcon,
	QuestionOutlineIcon,
	Modal,
} from 'native-base'
import { match } from '../../../utils/either'
import { Solicitud } from '../../../services/types'
import { LoadingScreen } from '../../components/loading.component'
import { SolicitudService } from '../../../services/solicitud.service'

type Props = NativeStackScreenProps<ActivityRouteParams, 'ListSolicitudes'>

export const ListSolicitudes = ({ navigation, route }: Props) => {
	const { ciudadanoId } = route.params
	const [solicitadas, setSolicitadas] = React.useState<Solicitud[]>()
	const [solicitudesRecibidas, setSolicitudesRecibidas] =
		React.useState<Solicitud[]>()

	const [isLoading, setLoading] = React.useState(true)

	const [modalCancelar, setModalCancelar] = React.useState(false)
	const [solicitudCancelable, setSolicitudCancelable] =
		React.useState<Solicitud>()

	const [modalAprobar, setModalAprobar] = React.useState(false)
	const [solicitudAprobable, setSolicitudAprobable] =
		React.useState<Solicitud>()

	const toast = useToast()

	const loadInitialData = async () => {
		const solicitudes = await SolicitudService.getSolicitante(ciudadanoId)
		match(
			solicitudes,
			t => setSolicitadas(t),
			err => {
				toast.show({ description: err })
				navigation.goBack()
			},
		)

		const recibidas = await SolicitudService.getSolicitado(ciudadanoId)
		match(
			recibidas,
			t => setSolicitudesRecibidas(t),
			err => {
				toast.show({ description: err })
				navigation.goBack()
			},
		)

		setModalCancelar(false)
		setModalAprobar(false)
		setLoading(false)
	}

	const formatFecha = fecha => {
		try {
			if (fecha != null) {
				const dia = fecha.substring(8, 10)
				const mes = fecha.substring(5, 7)
				const anio = fecha.substring(0, 4)
				return `Deben retirarse antes del ${dia}/${mes}/${anio}`
			}
			return 'No tiene fecha limite de retiro'
		} catch (error) {
			console.error('Error al formatear la fecha:', error)
			return 'No tiene fecha limite de retiro'
		}
	}

	const getEstado = (solicitud: Solicitud, solicitante: boolean) => {
		if (solicitante) {
			switch (solicitud.estado) {
			case 'PENDIENTE':
				return `Esperando hasta que ${solicitud.solicitado.nombre} acepte la solicitud.`
			case 'APROBADA':
				return 'Solicitud aceptada'
			case 'CANCELADA':
				if (solicitud.solicitanteId == solicitud.canceladorId)
					return 'Cancelaste esta solicitud'
				return `Solicitud Cancelada por ${solicitud.solicitado.nombre}`
			case 'EXPIRADA':
				return 'Solicitud Expirada'
			default:
				return 'No hay informacion del estado'
			}
		} else {
			switch (solicitud.estado) {
			case 'PENDIENTE':
				return 'Esperando hasta que aceptes la solicitud.'
			case 'APROBADA':
				return 'Solicitud aceptada'
			case 'CANCELADA':
				if (solicitud.solicitadoId == solicitud.canceladorId)
					return 'Cancelaste esta solicitud'
				return `Solicitud Cancelada por ${solicitud.solicitante.nombre}`
			case 'EXPIRADA':
				return 'Solicitud Expirada'
			default:
				return 'No hay informacion del estado'
			}
		}
	}

	const modalCancelarSolicitud = solicitud => {
		setSolicitudCancelable(solicitud)
		setModalCancelar(true)
	}

	const modalAprobarSolicitud = solicitud => {
		setSolicitudAprobable(solicitud)
		setModalAprobar(true)
	}

	const cerrarModalCancelar = () => {
		setModalCancelar(false)
	}

	const handleCancelarSolicitud = async (id: number) => {
		const solCancelada = await SolicitudService.cancelarSolicitud(
			id,
			ciudadanoId,
		)
		match(
			solCancelada,
			t => loadInitialData(),
			err => {
				toast.show({ description: err })
				navigation.goBack()
			},
		)
	}

	const handleAprobarSolicitud = async (id: number) => {
		const solAprobada = await SolicitudService.aprobarSolicitud(id)
		match(
			solAprobada,
			t => loadInitialData(),
			err => {
				toast.show({ description: err })
				navigation.goBack()
			},
		)
	}

	const cerrarModalAprobar = () => {
		setModalAprobar(false)
	}


	React.useEffect(() => {
		loadInitialData()
	}, [])

	if (isLoading) return <LoadingScreen />

	console.log(solicitadas, solicitadas[0].residuo, solicitadas[0].solicitado, solicitadas[0].solicitante)
	return (
		<ScrollView>
			{modalCancelar ? (
				<Modal
					isOpen={modalCancelar}
					onClose={() => cerrarModalCancelar()}
					size="lg"
				>
					<Modal.Content>
						<Modal.CloseButton />
						<Modal.Header alignItems="center">
							<Text bold fontSize="xl">
								Cancelar Solicitud
							</Text>
						</Modal.Header>
						<Modal.Body>
							<Text fontSize="md">
								¿Estás seguro que deseas cancelar esta solicitud?
							</Text>
							<Text fontSize="md" mt={2}>
								{solicitudCancelable.residuo.descripcion} de{' '}
								{solicitudCancelable.solicitado.nombre}
							</Text>
							<HStack justifyContent="center" mt={4} space={2}>
								<Button onPress={() => cerrarModalCancelar()}>Volver</Button>
								<Button
									onPress={() =>
										handleCancelarSolicitud(solicitudCancelable.id)
									}
								>
									Cancelar solicitud
								</Button>
							</HStack>
						</Modal.Body>
					</Modal.Content>
				</Modal>
			) : (
				<></>
			)}
			{modalAprobar ? (
				<Modal
					isOpen={modalAprobar}
					onClose={() => cerrarModalAprobar()}
					size="lg"
				>
					<Modal.Content>
						<Modal.CloseButton />
						<Modal.Header alignItems="center">
							<Text bold fontSize="xl">
								Aprobar Solicitud
							</Text>
						</Modal.Header>
						<Modal.Body>
							<Text fontSize="md">
								¿Estás seguro que deseas aprobar esta solicitud?
							</Text>
							<Text fontSize="md" mt={2}>
								{solicitudAprobable.residuo.descripcion} de{' '}
								{solicitudAprobable.solicitado.nombre}
							</Text>
							<HStack justifyContent="center" mt={4} space={2}>
								<Button onPress={() => cerrarModalAprobar()}>Volver</Button>
								<Button
									onPress={() => handleAprobarSolicitud(solicitudAprobable.id)}
								>
									Aprobar solicitud
								</Button>
							</HStack>
						</Modal.Body>
					</Modal.Content>
				</Modal>
			) : (
				<></>
			)}
			<Center w="100%">
				<View>
					<Box mb={2} />
					<Text bold fontSize="md">
						Estas son todas tus solicitudes
					</Text>
					<Box mb={2} />
					{solicitadas && solicitadas.length > 0 ? (
						solicitadas.map((solicitud, idx) => (
							<Box
								key={`box-${idx}`}
								mb={2}
								p={2}
								borderWidth={1}
								borderColor="gray.300"
								borderRadius="md"
								shadow={1}
								maxWidth={350}
								//bg={selectedUserPoint === userIndex ? 'green.100' : 'white'}
							>
								<HStack
									space={2}
									mt="0.5"
									key={`name-${idx}`}
									alignItems="center"
								>
									<Text fontSize="sm">#{solicitud.id}</Text>
									<Text fontSize="sm">
										{solicitud.solicitadoId ==
										solicitud.residuo.puntoResiduo?.ciudadanoId
											? `Retirar residuos de ${solicitud.solicitado.nombre}`
											: `Depositar tus residuos en el punto de ${solicitud.solicitado.nombre}`}
									</Text>
								</HStack>
								<HStack
									space={2}
									mt="0.5"
									key={`res-${idx}`}
									alignItems="center"
								>
									<InfoOutlineIcon size="3" color="emerald.600" />
									<Text fontSize="sm">
										{solicitud.residuo.tipoResiduo.nombre}
									</Text>
								</HStack>
								<HStack
									space={2}
									mt="0.5"
									key={`desc-${idx}`}
									alignItems="center"
								>
									<DeleteIcon size="3" color="emerald.600" />
									<Text fontSize="sm" numberOfLines={4}>
										{solicitud.residuo.descripcion}
									</Text>
								</HStack>
								<HStack
									space={2}
									mt="0.5"
									key={`date-${idx}`}
									alignItems="center"
								>
									<WarningOutlineIcon size="3" color="emerald.600" />
									<Text fontSize="sm">
										{formatFecha(solicitud.residuo.fechaLimiteRetiro)}
									</Text>
								</HStack>
								<HStack
									space={2}
									mt="0.5"
									key={`state-${idx}`}
									alignItems="center"
								>
									<QuestionOutlineIcon size="3" color="emerald.600" />
									<Text fontSize="sm" numberOfLines={4}>
										{getEstado(solicitud, true)}
									</Text>
								</HStack>
								{solicitud.estado == 'CANCELADA' ||
								solicitud.estado == 'EXPIRADA' ? (
										''
									) : (
										<>
											<Box mb={2} />
											<Center justifyContent="space-between">
												<Button onPress={() => modalCancelarSolicitud(solicitud)}>
												Cancelar solicitud
												</Button>
											</Center>
										</>
									)}
							</Box>
						))
					) : (
						<View
							style={{
								flex: 1,
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<WarningOutlineIcon size={5} color="red.600" />
							<Text style={{ fontSize: 14, textAlign: 'center' }}>
								Aun no dispones de solicitudes de retiro, puedes generar alguna
								desde el mapa en el inicio.
							</Text>
						</View>
					)}
				</View>
			</Center>
			<Center>
				<View>
					<Box mb={2} />
					<Text bold fontSize="md">
						Estas son todas las solicitudes que recibiste
					</Text>
					<Box mb={2} />
					{solicitudesRecibidas && solicitudesRecibidas.length > 0 ? (
						solicitudesRecibidas.map((solicitud, idx) => (
							<Box
								key={`box-${idx}`}
								mb={2}
								p={2}
								borderWidth={1}
								borderColor="gray.300"
								borderRadius="md"
								shadow={1}
								maxWidth={350}
							>
								<HStack
									space={2}
									mt="0.5"
									key={`name-${idx}`}
									alignItems="center"
								>
									<Text fontSize="sm">#{solicitud.id}</Text>
									<Text fontSize="sm">
										{solicitud.solicitanteId ==
										solicitud.residuo.puntoResiduo?.ciudadanoId
											? `${solicitud.solicitante.nombre} quiere depositar un residuo`
											: `${solicitud.solicitante.nombre} quiere retirar tus residuos`}
									</Text>
								</HStack>
								<HStack
									space={2}
									mt="0.5"
									key={`res-${idx}`}
									alignItems="center"
								>
									<InfoOutlineIcon size="3" color="emerald.600" />
									<Text fontSize="sm">
										{solicitud.residuo.tipoResiduo.nombre}
									</Text>
								</HStack>
								<HStack
									space={2}
									mt="0.5"
									key={`desc-${idx}`}
									alignItems="center"
								>
									<DeleteIcon size="3" color="emerald.600" />
									<Text fontSize="sm" numberOfLines={4}>
										{solicitud.residuo.descripcion}
									</Text>
								</HStack>
								<HStack
									space={2}
									mt="0.5"
									key={`date-${idx}`}
									alignItems="center"
								>
									<WarningOutlineIcon size="3" color="emerald.600" />
									<Text fontSize="sm">
										{formatFecha(solicitud.residuo.fechaLimiteRetiro)}
									</Text>
								</HStack>
								<HStack
									space={2}
									mt="0.5"
									key={`state-${idx}`}
									alignItems="center"
								>
									<QuestionOutlineIcon size="3" color="emerald.600" />
									<Text fontSize="sm" numberOfLines={4}>
										{getEstado(solicitud, false)}
									</Text>
								</HStack>
								{solicitud.estado === 'PENDIENTE' ? (
									<>
										<Box mb={2} />
										<Center justifyContent="space-between">
											<Button onPress={() => modalAprobarSolicitud(solicitud)}>
												Aprobar Solicitud
											</Button>
										</Center>
									</>
								) : (
									<></>
								)}
								{solicitud.estado == 'CANCELADA' ||
								solicitud.estado == 'EXPIRADA' ? (
										<></>
									) : (
										<>
											<Box mb={2} />
											<Center justifyContent="space-between">
												<Button onPress={() => modalCancelarSolicitud(solicitud)}>
												Cancelar solicitud
												</Button>
											</Center>
										</>
									)}
							</Box>
						))
					) : (
						<View
							style={{
								justifyContent: 'center',
								alignItems: 'center',
							}}
							mb="4"
						>
							<WarningOutlineIcon size={5} color="red.600" />
							<Text style={{ fontSize: 14, textAlign: 'center' }}>
								No recibiste ninguna solicitud
							</Text>
						</View>
					)}
				</View>
			</Center>
		</ScrollView>
	)
}
