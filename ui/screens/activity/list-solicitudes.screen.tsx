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
	ChevronUpIcon,
	ChevronDownIcon,
} from 'native-base'
import { ifLeft, ifRight, match } from '../../../utils/either'
import { Solicitud, Transaccion } from '../../../services/types'
import { LoadingScreen } from '../../components/loading.component'
import { SolicitudService } from '../../../services/solicitud.service'
import { FontAwesome, FontAwesome5, MaterialCommunityIcons  } from '@expo/vector-icons'
import { TouchableOpacity, Image } from 'react-native'
import { TransaccionService } from '../../../services/transaccion.service'
import { formatFecha } from '../../../utils/days'

type Props = NativeStackScreenProps<ActivityRouteParams, 'ListSolicitudes'>

export const ListSolicitudes = ({ navigation, route }: Props) => {
	const { ciudadanoId } = route.params
	const [solicitadas, setSolicitadas] = React.useState<Solicitud[]>()
	const [solicitudesRecibidas, setSolicitudesRecibidas] = React.useState<Solicitud[]>()
	const [isLoading, setLoading] = React.useState(true)
	const [modalCancelar, setModalCancelar] = React.useState(false)
	const [solicitudCancelable, setSolicitudCancelable] = React.useState<Solicitud>()
	const [modalAprobar, setModalAprobar] = React.useState(false)
	const [solicitudAprobable, setSolicitudAprobable] = React.useState<Solicitud>()
	const [modalAgregar, setModalAgregar] = React.useState(false)
	const [solicitudAgregar, setSolicitudAgregar] = React.useState<Solicitud>()
	const [userTransactions, setUserTransactions] = React.useState<Transaccion[]>([],)
	const [selectedUserTransaction, setSelectedUserTransaction] = React.useState<number | null>(null)
	const [modalErrorTransaccion, setModalErrorTransaccion] = React.useState(false)
	const [showSolicitante, setSolicitante] = React.useState(false)
	const [showSolicitado, setSolicitado] = React.useState(false)
	const [viewImage, setViewImage] = React.useState(false)
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

	const modalAgregarTransaccion = async (solicitud: Solicitud) => {
		const userTransactions = await TransaccionService.getAll({
			ciudadanoId: ciudadanoId,
			puntosReciclaje: [solicitud.puntoReciclajeId]
		})
		match(
			userTransactions,
			t => setUserTransactions(t),
			e => setUserTransactions([])
		)
		setSolicitudAgregar(solicitud)
		setModalAgregar(true)
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
			t => {loadInitialData()
				toast.show({ description: "¡Solicitud aprobada con exito!" })},
			err => {
				toast.show({ description: err })
				navigation.goBack()
			},
		)
	}

	const handleAgregarSolicitud = async (id: number) => {
		const solAgregada = await TransaccionService.addResiduo(
			id,
			solicitudAgregar.residuo.id,
		)
		match(
			solAgregada,
			t => {loadInitialData()
				toast.show({ description: "¡Solicitud agregada con exito!" })},

			err => {
				toast.show({ description: err })
				navigation.goBack()
			},
		)
		cerrarModalAgregar()
	}

	const handleCrearNuevaTransaccion = async () => {
		const postTransaccion = await TransaccionService.createTransaccion(
			solicitudAgregar.puntoReciclajeId,
			solicitudAgregar.residuo.id,
			solicitudAgregar.id
		)
		ifLeft(postTransaccion, t => {
			toast.show({ description: "¡Transaccion creada con exito!" })
			cerrarModalAgregar()
			//handleAgregarSolicitud(t.id)
		})
		ifRight(postTransaccion, t => {
			setModalAgregar(false)
			setModalErrorTransaccion(true)
		})
	}

	const cerrarModalAprobar = () => {
		setModalAprobar(false)
	}

	const cerrarModalAgregar = () => {
		setSelectedUserTransaction(null)
		setModalAgregar(false)
		setModalErrorTransaccion(false)
		loadInitialData()
	}

	const handleSolicitadoPress = () => {
		setSolicitado(!showSolicitado)
	}

	const handleSolicitantePress = () => {
		setSolicitante(!showSolicitante)
	}

	const verFoto = () => {
		setViewImage(!viewImage)
	}

	React.useEffect(() => {
		const unsubscribeFocus = navigation.addListener('focus', () => {
			setSolicitante(false)
			setSolicitado(false)
			loadInitialData()
		})

		return unsubscribeFocus
	}, [navigation])

	if (isLoading) return <LoadingScreen />

	return (
		<ScrollView
			contentContainerStyle={{ alignItems: 'center', paddingTop: 20 }}
		>
			{modalErrorTransaccion ? (
				<>
					<Modal
						isOpen={modalErrorTransaccion}
						onClose={() => cerrarModalAgregar()}
						size="lg"
					>
						<Modal.Content>
							<Modal.CloseButton />
							<Modal.Header alignItems="center">
								<Text bold fontSize="xl">
									Crear Transaccion
								</Text>
							</Modal.Header>
							<Modal.Body>
								<View
									style={{
										flex: 1,
										justifyContent: 'center',
										alignItems: 'center',
									}}
								>
									<WarningOutlineIcon size={5} color="red.600" />
									<Text style={{ fontSize: 14, textAlign: 'center' }}>
										Ocurrio un error al crear la transaccion, reintenta mas
										tarde.
									</Text>
								</View>
							</Modal.Body>
							<Modal.Footer>
								<Center flex={1}>
									<HStack justifyContent="center" mt={4} space={2}>
										<Button onPress={() => cerrarModalAgregar()}>Volver</Button>
									</HStack>
								</Center>
							</Modal.Footer>
						</Modal.Content>
					</Modal>
				</>
			) : (
				<></>
			)}
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
						</Modal.Body>
						<Modal.Footer>
							<Center flex={1}>
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
							</Center>
						</Modal.Footer>
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
							<Text fontSize="md" mt={1}>
								<Text style={{ fontWeight: 'bold' }}>Solicitante: </Text>
								{solicitudAprobable.solicitante.nombre}
							</Text>
							<Text fontSize="md" mt={1}>
								<Text style={{ fontWeight: 'bold' }}>Tipo de residuo: </Text>
								{solicitudAprobable.residuo.tipoResiduo.nombre}
							</Text>
							<Text fontSize="md" mt={1}>
								<Text style={{ fontWeight: 'bold' }}>Descripción: </Text>
								{solicitudAprobable.residuo.descripcion}
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
			{modalAgregar ? (
				<Modal
					isOpen={modalAgregar}
					onClose={() => cerrarModalAgregar()}
					size="lg"
				>
					<Modal.Content>
						<Modal.CloseButton />
						<Modal.Header alignItems="center">
							<Text bold fontSize="xl">
								Transacciones
							</Text>
						</Modal.Header>
						<Modal.Body>
							<Text fontSize="md" style={{ marginBottom: 1 }}>
								¿A que transaccion queres agregar el residuo de{' '}
								{solicitudAgregar.solicitado.nombre}?
							</Text>
							<Text fontSize="md" style={{ marginBottom: 1 }}>
								Podes elegir una existente o crear una nueva.
							</Text>
							<Text fontSize="md" mt={1}>
								<Text style={{ fontWeight: 'bold' }}>Tipo de residuo: </Text>
								{solicitudAgregar.residuo.tipoResiduo.nombre}
							</Text>
							<Text fontSize="md" mt={1}>
								<Text style={{ fontWeight: 'bold' }}>Descripción: </Text>
								{solicitudAgregar.residuo.descripcion}
							</Text>
							<View>
								<Text
									bold
									fontSize="md"
									style={{ marginBottom: 2, marginTop: 4 }}
								>
									Transacciones existentes:
								</Text>
								<HStack justifyContent="center" mt={4} space={2}></HStack>
								{userTransactions && userTransactions.length > 0 ? (
									userTransactions.map((transaction, idx) => (
										<React.Fragment key={`transaction-${idx}`}>
											<TouchableOpacity
												key={`userT-${idx}`}
												onPress={() => setSelectedUserTransaction(idx)}
											>
												<Box
													key={`box-${idx}`}
													mb={2}
													p={2}
													borderWidth={1}
													borderColor="gray.300"
													borderRadius="md"
													shadow={1}
													maxWidth={350}
													bg={
														selectedUserTransaction === idx
															? 'green.100'
															: 'white'
													}
												>
													<HStack
														space={2}
														mt="0.5"
														key={`stack-${idx}`}
														alignItems="center"
													>
														<Text fontSize="sm">
															Transaccion #{transaction.id}
														</Text>
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
												</Box>
											</TouchableOpacity>
										</React.Fragment>
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
												No dispones de transacciones abiertas, crea una
												presionando el boton de "Crear nueva Transaccion" y la
												solicitud se asignara automaticamente.
											</Text>
										</View>
									</>
								)}
								<HStack justifyContent="center" mt={4} space={2}>
									<Button onPress={() => handleCrearNuevaTransaccion()}>
										Crear nueva Transaccion
									</Button>
								</HStack>
							</View>
						</Modal.Body>
						<Modal.Footer>
							<Center flex={1}>
								<HStack justifyContent="center" mt={4} space={2}>
									{userTransactions &&
									userTransactions.length > 0 &&
									selectedUserTransaction != null ? (
										<>
											<Button onPress={() => cerrarModalAgregar()}>
												Volver
											</Button>
											<Button
												onPress={() =>
													handleAgregarSolicitud(
														userTransactions[selectedUserTransaction].id,
													)
												}
											>
												Agregar a la seleccionada
											</Button>
										</>
									) : (
										<>
											<Button onPress={() => cerrarModalAgregar()}>
												Volver
											</Button>
										</>
									)}
								</HStack>
							</Center>
						</Modal.Footer>
					</Modal.Content>
				</Modal>
			) : (
				<></>
			)}
			<Center w="100%" mt="2">
				<Box mb={4} />
				<TouchableOpacity onPress={() => handleSolicitantePress()}>
					<Box
						mb={2}
						p={2}
						borderWidth={1}
						borderColor="gray.300"
						borderRadius="md"
						shadow={1}
						width={280}
						background={showSolicitante ? '#D9F3D5' : 'white'}
					>
						<HStack
							space={2}
							justifyContent="space-between"
							alignItems="center"
						>
							<Text color="black" fontSize="md" bold>
								Ver Solicitudes salientes
							</Text>
							{showSolicitante ? (
								<ChevronUpIcon size="5" mt="0.5" color="emerald.500" />
							) : (
								<ChevronDownIcon size="5" mt="0.5" color="emerald.500" />
							)}
						</HStack>
					</Box>
				</TouchableOpacity>
				{showSolicitante ? (
					<>
						<Box mb={2} />
						<Text bold fontSize="md" textAlign="center">
							Estas son todas las solicitudes que realizaste
						</Text>
						<Box mb={2} />
						{solicitadas && solicitadas.length > 0 ? (
							solicitadas.map((solicitud, idx) => (
								<React.Fragment key={`sol-${idx}`}>
									<Box
										key={`boxSal-${idx}`}
										p={2}
										borderWidth={1}
										borderColor="gray.300"
										borderRadius="md"
										shadow={1}
										maxWidth={500}
										bg={'white'}
										width="90%"
										marginBottom={2}
									>
										<HStack
											space={2}
											mt="0.5"
											key={`name-${idx}`}
											alignItems="center"
										>
											<Text fontSize="sm">#{solicitud.id}</Text>
											<Text flex={1} fontSize="sm">
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
											<DeleteIcon size="3" color="emerald.600" />
											<Text flex={1} fontSize="sm">
												{solicitud.residuo.tipoResiduo.nombre}
											</Text>
										</HStack>
										<HStack
											space={2}
											mt="0.5"
											key={`desc-${idx}`}
											alignItems="flex-start"
										>
											<InfoOutlineIcon
												size="3"
												color="emerald.600"
												style={{ marginTop: 4 }}
											/>
											<Text flex={1} fontSize="sm" numberOfLines={25}>
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
											<Text flex={1} fontSize="sm">
												{formatFecha(
													solicitud.residuo.fechaLimiteRetiro,
													false,
												)}
											</Text>
										</HStack>
										<HStack
											space={2}
											mt="0.5"
											key={`state-${idx}`}
											alignItems="center"
										>
											<QuestionOutlineIcon size="3" color="emerald.600" />
											<Text flex={1} fontSize="sm" numberOfLines={4} fontWeight="bold" color="#008000" >
												{getEstado(solicitud, true)}
											</Text>
										</HStack>
										{solicitud.residuo.base64 && (
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
													<Image source={{ uri: 'data:image/jpeg;base64,' + solicitud.residuo.base64 }} style={{ width: 200, height: 200 }} />
												</View>
												)}
											</View>
										</>
										)}
										{solicitud.estado == 'PENDIENTE' ? (
											<>
												<Box mb={2} />
												<View
													style={{
														flexDirection: 'row',
														justifyContent: 'center',
													}}
												>
													<Button
														onPress={() => modalCancelarSolicitud(solicitud)}
													>
														Cancelar solicitud
													</Button>
												</View>
											</>
										) : (
											solicitud.estado == 'APROBADA' && (
												<>
													<Box mb={2} />
													<View
														style={{
															flexDirection: 'row',
															justifyContent: 'center',
														}}
													>
														{solicitud.solicitadoId ==
															solicitud.residuo.puntoResiduo?.ciudadanoId && (
															<Center justifyContent="space-between">
																<Button
																	onPress={() =>
																		modalAgregarTransaccion(solicitud)
																	}
																>
																	Agregar a transaccion
																</Button>
															</Center>
														)}
													</View>
												</>
											)
										)}
									</Box>
								</React.Fragment>
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
									Aun no dispones de solicitudes de retiro, puedes generar
									alguna desde el mapa en el inicio.
								</Text>
							</View>
						)}
					</>
				) : (
					''
				)}
			</Center>
			<Center w="100%" mt="2">
				<Box mb={4} />
				<TouchableOpacity onPress={() => handleSolicitadoPress()}>
					<Box
						mb={2}
						p={2}
						borderWidth={1}
						borderColor="gray.300"
						borderRadius="md"
						shadow={1}
						width={280}
						background={showSolicitado ? '#D9F3D5' : 'white'}
					>
						<HStack
							space={2}
							justifyContent="space-between"
							alignItems="center"
						>
							<Text color="black" fontSize="md" bold>
								Ver Solicitudes entrantes
							</Text>

							{showSolicitado ? (
								<ChevronUpIcon size="5" mt="0.5" color="emerald.500" />
							) : (
								<ChevronDownIcon size="5" mt="0.5" color="emerald.500" />
							)}
						</HStack>
					</Box>
				</TouchableOpacity>
				{showSolicitado && (
					<>
						<Box mb={2} />
						<Text bold fontSize="md" textAlign="center">
							Estas son todas las solicitudes que recibiste
						</Text>
						<Box mb={2} />
						{solicitudesRecibidas && solicitudesRecibidas.length > 0 ? (
							solicitudesRecibidas.map((solicitud, idx) => (
								<React.Fragment key={`solic-${idx}`}>
									<Box
										key={`box-${idx}`}
										p={2}
										borderWidth={1}
										borderColor="gray.300"
										borderRadius="md"
										shadow={1}
										maxWidth={500}
										bg={'white'}
										width="90%"
										marginBottom={2}
									>
										<HStack
											space={2}
											mt="0.5"
											key={`name-${idx}`}
											alignItems="center"
										>
											<Text fontSize="sm">#{solicitud.id}</Text>
											<Text flex={1} fontSize="sm">
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
											<DeleteIcon size="3" color="emerald.600" />
											<Text flex={1} fontSize="sm">
												{solicitud.residuo.tipoResiduo.nombre}
											</Text>
										</HStack>
										<HStack
											space={2}
											mt="1"
											key={`desc-${idx}`}
											alignItems="flex-start"
										>
											<InfoOutlineIcon
												size="3"
												color="emerald.600"
												style={{ marginTop: 4 }}
											/>
											<Text flex={1} fontSize="sm" numberOfLines={15}>
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
											<Text flex={1} fontSize="sm">
												{formatFecha(
													solicitud.residuo.fechaLimiteRetiro,
													false,
												)}
											</Text>
										</HStack>
										<HStack
											space={2}
											mt="0.5"
											key={`state-${idx}`}
											alignItems="center"
										>
											<QuestionOutlineIcon size="3" color="emerald.600" />
											<Text flex={1} fontSize="sm" numberOfLines={4} fontWeight="bold" color="#008000">
												{getEstado(solicitud, false)}
											</Text>
										</HStack>
										{solicitud.residuo.base64 && (
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
													<Image source={{ uri: 'data:image/jpeg;base64,' + solicitud.residuo.base64 }} style={{ width: 200, height: 200 }} />
												</View>
												)}
											</View>
										</>
										)}
										{solicitud.estado === 'PENDIENTE' ? (
											<>
												<Box mb={2} />
												<View
													style={{
														flexDirection: 'row',
														justifyContent: 'center',
													}}
												>
													<Button
														style={{ marginRight: 10 }}
														onPress={() => modalCancelarSolicitud(solicitud)}
													>
														Cancelar
													</Button>
													<Button
														onPress={() => modalAprobarSolicitud(solicitud)}
													>
														Aprobar
													</Button>
												</View>
											</>
										) : (
											solicitud.estado == 'APROBADA' && (
												<>
													<Box mb={2} />
													<View
														style={{
															flexDirection: 'row',
															justifyContent: 'center',
														}}
													>
														{solicitud.solicitanteId ==
															solicitud.residuo.puntoResiduo?.ciudadanoId && (
															<Center justifyContent="space-between">
																<Button
																	onPress={() =>
																		modalAgregarTransaccion(solicitud)
																	}
																>
																	Agregar a transaccion
																</Button>
															</Center>
														)}
													</View>
												</>
											)
										)}
									</Box>
								</React.Fragment>
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
					</>
				)}
			</Center>
		</ScrollView>
	)
}
