import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React from 'react'
import { ActivityRouteParams, ActivityRoutes } from '../../../constants/routes'
import {
	Box,
	Button,
	Center,
	FormControl,
	Heading,
	Input,
	Modal,
	ScrollView,
	Select,
	TextArea,
	VStack,
	View,
	useToast,
	Text,
	Checkbox,
	WarningOutlineIcon,
	Spinner,
} from 'native-base'
import { TipoResiduoService } from '../../../services/tipos.service'
import { ifLeft, ifRight, match } from '../../../utils/either'
import { Punto, PuntoReciclaje, Residuo, TipoResiduo } from '../../../services/types'
import { LoadingScreen } from '../../components/loading.component'
import DateTimePicker from '@react-native-community/datetimepicker'
import { ResiduoService } from '../../../services/residuo.service'
import { Keyboard, Image } from 'react-native'
import { UserService } from '../../../services/user.service'
import { PuntoService } from '../../../services/punto.service'
import * as Location from 'expo-location'
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import FileSystem from 'expo-file-system';


type Props = NativeStackScreenProps<ActivityRouteParams, 'NewResiduo'>

export const NewResiduo = ({ navigation, route }: Props) => {
	const residuoId = route.params?.residuoId ? route.params?.residuoId : undefined
	const { ciudadanoId, puntoResiduoId } = route.params
	const [tipos, setTipos] = React.useState<TipoResiduo[]>()
	const [isLoading, setLoading] = React.useState(true)
	const [residuo, setResiduo] = React.useState<Residuo>()
	const [formData, setFormData] = React.useState<FormState>({
		tipo: residuo?.tipoResiduo.id,
		descripcion: residuo?.descripcion || '',
		fechaLimite: residuo?.fechaLimiteRetiro ? new Date(residuo.fechaLimiteRetiro) : null,
	  });
	const [showModal, setShowModal] = React.useState(false);
	const [newResiduo, setNewResiduo] = React.useState<Residuo>()
	const [puntosDirec, setPuntosDirec] = React.useState<PuntoConDireccion[]>()
	const [loadingModal, setLoadingModal] = React.useState(true)
	type PuntoConDireccion = Punto & {
		direccion: string;
	  };
	const toast = useToast()

	const loadInitialData = async () => {
		await ImagePicker.requestCameraPermissionsAsync();

		const tipos = await TipoResiduoService.getAll()
		match(
			tipos,
			t => setTipos(t),
			err => {
				toast.show({ description: err })
				navigation.goBack()
			},
		)

		if (residuoId) {
			// Es pantalla de edicion
			const r = await ResiduoService.get(residuoId)
			match(
				r,
				residuo => {
					setResiduo(residuo)
					setFormData({
						tipo: residuo.tipoResiduo.id,
						descripcion: getDescripcion(residuo.descripcion),
						fechaLimite: residuo.fechaLimiteRetiro ? new Date(residuo.fechaLimiteRetiro) : null,
						foto: residuo.base64 ? residuo.base64 : null
					  });
					setLoading(false)
				},
				err => {
					toast.show({ description: err })
					navigation.goBack()
				},
			)
		}

		setLoading(false)
		setLoading(false)
	}

	function getDescripcion(cadena) {
		  const partes = cadena.split('\u200B\n');
		  const descripcion = partes[0].trim();
		  return descripcion
	}

	const getPuntos = async (idRes) => {
		const user = await UserService.getCurrent()
		const points = await PuntoService.getAll({
			tipos: ['RECICLAJE'],
			ciudadanoId: user.ciudadanoId,
			residuos:[idRes]
		})

		if (points.length === 0) {
			setPuntosDirec([])
			setLoadingModal(false)
		} else {
			getDirections(points)
			.then(() => {
			  setShowModal(true);
			})
			.catch((error) => {
			  console.error('Error obteniendo direcciones:', error);
			  setShowModal(true);
			}).finally(() => {setLoadingModal(false)})
		}
	}

	const getDirections = async (points: Punto[]) => {
		const updatedPoints: PuntoConDireccion[] = [];

		try {
		  for (const point of points) {
			const location = await Location.reverseGeocodeAsync({
			  latitude: point.latitud,
			  longitude: point.longitud,
			});

			let address = '';
			if (location != null && location.length > 0) {
			  const loc = location[0];
			  address += loc.name ? loc.name : '';
			  address += loc.city ? ', ' + loc.city : '';
			  address += loc.postalCode ? ', ' + loc.postalCode : '';
			  address += loc.region ? ', ' + loc.region : '';
			} else {
			  address = 'No podemos brindar la dirección.';
			}

			updatedPoints.push( {
			  ...point,
			  direccion: address,
			});

		  }
		} catch (error) {
		}
		setPuntosDirec(updatedPoints)
	  }

	  const handleRealizarSolicitud = async (id, puntoId) => {
		const result = await ResiduoService.postSolicitarDeposito(id,puntoId)

		match(
			result,
			r => {
				toast.show({ description: 'Solicitud creada con exito' })
				closeModal()
			},
			err => {
				toast.show({ description: 'Solicitud creada con exito' })
				closeModal()
			},
		)
	}

	const closeModal = () => {
		setShowModal(!showModal);
		navigation.navigate(ActivityRoutes.listResiduos)
	  };

	React.useEffect(() => {
		loadInitialData()
	}, [])

	const onSubmit = async (form: FormState) => {
		const savedResiduo = await ResiduoService.save({
			ciudadanoId,
			puntoResiduoId,
			descripcion: form.descripcion,
			tipoResiduoId: form.tipo,
			fechaLimite: form.fechaLimite?.toISOString() || null,
			id: residuo? residuo.id : null,
			base64: formData.foto ? formData.foto : null
		})
		match(
			savedResiduo,
			r => {
				if(residuo){
					toast.show({ description: 'Residuo editado exitosamente' })
					navigation.navigate(ActivityRoutes.listResiduos)
				} else{
					setShowModal(true)
					toast.show({ description: 'Residuo creado exitosamente' })
					setNewResiduo(r)
					getPuntos(r.tipoResiduo.id)
					return
				}
			},
			err => {
				toast.show({ description: err })
			},
		)
	}

	if (isLoading) return <LoadingScreen />

	return (
		<ScrollView>
			<Center w="100%">
				<Box p="2" py="2" w="90%" maxW="290">
					<VStack space={3} mt="4">
						<Form
							onSubmit={onSubmit}
							tipos={tipos}
							formData={formData}
							setFormData={setFormData}
							r={residuo}
						/>
					</VStack>
				</Box>
			</Center>
			<Modal isOpen={showModal} onClose={closeModal}>
				<Modal.Content>
					<Modal.CloseButton />
					<Modal.Header>
						<Heading>Entrega tu residuo</Heading>
					</Modal.Header>
					<Modal.Body>
						{loadingModal && (
							<Spinner color="emerald.800" accessibilityLabel="Loading posts" />
						)}
						<View style={{ alignItems: 'center' }}>
							{puntosDirec && puntosDirec.length != 0 && (
								<View style={{ flex: 1, marginRight: 10, marginBottom: 5 }}>
									<Text style={{ fontSize: 10, textAlign: 'center' }}>
										Todos estos puntos aceptan el residuo que creaste, podes
										entregarlo al que desees.
									</Text>
								</View>
							)}
							{puntosDirec && puntosDirec.length != 0 ? (
								puntosDirec.map((point, idx) => (
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
										<Text fontSize="sm" numberOfLines={4}>
											<Text style={{ fontWeight: 'bold' }}>Nombre:</Text>{' '}
											{point.titulo}
										</Text>
										<Text fontSize="sm" numberOfLines={4}>
											<Text style={{ fontWeight: 'bold' }}>Acepta:</Text>{' '}
											{
												tipos.filter(r => r.id == newResiduo.tipoResiduo.id)[0]
													.nombre
											}
										</Text>
										<Text fontSize="sm" numberOfLines={4}>
											<Text style={{ fontWeight: 'bold' }}>Direccion:</Text>{' '}
											{point.direccion
												? point.direccion
												: 'No se pudo obtener.'}
										</Text>
										<Box mb={2} />
										<View
											style={{
												flexDirection: 'row',
												justifyContent: 'center',
											}}
										>
											<Center justifyContent="space-between">
												<Button
													onPress={() =>
														handleRealizarSolicitud(newResiduo.id, point.id)
													}
												>
													Entregar
												</Button>
											</Center>
										</View>
									</Box>
								))
							) : !loadingModal && (
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
											Por el momento no hay puntos donde entregar este tipo de
											residuo.
										</Text>
									</View>
								</>
							)}
						</View>
					</Modal.Body>
				</Modal.Content>
			</Modal>
		</ScrollView>
	)
}

type FormState = {
	tipo?: number
	descripcion?: string
	fechaLimite?: Date
	foto?: string
}

type Errors = {
	has: boolean
	tipo?: string
	descripcion?: string
	entrega?: string
}

const Form = ({
	onSubmit,
	tipos,
	formData,
	setFormData,
	r,
  }: {
	onSubmit: (form: FormState) => Promise<void>;
	tipos: TipoResiduo[];
	formData: FormState;
	setFormData: React.Dispatch<React.SetStateAction<FormState>>;
	r: Residuo
  }) => {
	const [errors, setErrors] = React.useState<Errors>({ has: false })
	const [showDatePicker, setShowDatePicker] = React.useState(false)
	const [loading, setLoading] = React.useState(false)
	const [image, setImage] = React.useState(formData.foto);
	const [selectedEntregado, setSelectedEntregado] = React.useState<string[]>(() =>
	{
		if (r) {
			const partes = r.descripcion.split('\u200B\n');
			const entregaInfo = partes.slice(1);
			let values: string[] = [];

			if (entregaInfo[0].includes('caja')) { values.push('0'); }
			if (entregaInfo[0].includes('bolsa')) { values.push('1'); }
			if (entregaInfo[0].includes('compacto')) { values.push('2'); }
			if (entregaInfo[0].includes('Mojado/Húmedo')) { values.push('3'); }
			if (entregaInfo[0].includes('5kg')) { values.push('4'); }

			return [...values];
		  }

		  return [];
	})

	const pickImage = async () => {
		let result = await ImagePicker.launchCameraAsync({
		mediaTypes: ImagePicker.MediaTypeOptions.All,
		allowsEditing: true,
		base64: false,
		aspect: [4, 3],
		quality: 0.3,
		});

		formData.foto = "holi"
		if (!result.canceled) {
			const resized = await ImageManipulator.manipulateAsync(
				result.assets[0].uri,
				[{ resize: { width: 400 } }],
				{ base64: true, compress: 1, format: ImageManipulator.SaveFormat.JPEG }
			);

			setImage(resized.base64)
			setFormData({
				...formData, foto: resized.base64
			})
			// este base64 tiene la imagen encodeada en un string
			// la idea es mandar este base64 en el POST/PUT
			// luego, en el GET va a venir un nuevo campo que se va a llamar base64 que va a tener la foto
		}
	};

	const isValid = () => {
		const newErrors: Errors = { has: false }
		if (!formData.tipo) {
			newErrors.has = true
			newErrors.tipo = 'Debe elegir un tipo de residuo'
		}
		if (!formData.descripcion || formData.descripcion === '') {
			newErrors.has = true
			newErrors.descripcion =
				'Complete la descripcion indicando que tiene disponible para retirar'
		}
		if (selectedEntregado.length === 0) {
			newErrors.has = true
			newErrors.entrega =
				'Seleccione al menos una caracteristica sobre como entregas el residuo.'
			formData.descripcion = r.descripcion.split('\u200B\n').slice(0)[0]
			setFormData({
				...formData,
			})
		}

		setErrors(newErrors)
		return !newErrors.has
	}

	const onChangeDate = (event, selected) => {
		const currentDate = selected || formData.fechaLimite
		setShowDatePicker(false)
		setFormData({ ...formData, fechaLimite: currentDate })
	}

	const doSubmit = async () => {
		setLoading(true)

		const selectedDescriptions = []
		if (formData.descripcion) {
			selectedDescriptions.push(formData.descripcion)
			selectedDescriptions.push(
				'\u200B\nAdemas tene en cuenta estas caracteristicas para retirar el residuo: ',
			)
			selectedEntregado.forEach(value => {
				switch (value) {
					case '0':
						selectedDescriptions.push('Se entrega embalado en caja.')
						break
					case '1':
						selectedDescriptions.push('Se entrega embalado en bolsa.')
						break
					case '2':
						selectedDescriptions.push('Es compacto.')
						break
					case '3':
						selectedDescriptions.push('Está Mojado/Húmedo.')
						break
					case '4':
						selectedDescriptions.push('Pesa más de 5kg.')
						break
					default:
						break
				}
			})
		}

		formData.descripcion = selectedDescriptions.join(' ')

		setFormData({
			...formData,
		})

		if (isValid()) {
			await onSubmit(formData)
			setLoading(false)
			return
		}

		setLoading(false)
	}

	const formatDate = date => {
		if (!date) return ''
		return new Intl.DateTimeFormat('es', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
		}).format(date)
	}

	return (
		<>
			{showDatePicker && (
				<DateTimePicker
					value={formData.fechaLimite || new Date()}
					mode="date"
					display="default"
					onChange={onChangeDate}
					minimumDate={new Date()}
				/>
			)}
			<FormControl isRequired isInvalid={'tipo' in errors} isReadOnly>
				<FormControl.Label>Tipo de Residuo</FormControl.Label>
				<Select
					selectedValue={formData.tipo ? `${formData.tipo}` : ''}
					placeholder="Tipo de Residuo"
					onValueChange={v =>
						setFormData({ ...formData, tipo: v ? parseInt(v) : undefined })
					}
				>
					{tipos.map(t => (
						<Select.Item value={`${t.id}`} key={t.id} label={t.nombre} />
					))}
				</Select>
				<FormControl.ErrorMessage _text={{ fontSize: 'xs' }}>
					{errors.tipo}
				</FormControl.ErrorMessage>
			</FormControl>
			<FormControl isRequired isInvalid={'entrega' in errors}>
				<FormControl.Label>Descripcion</FormControl.Label>
				<Text fontSize="sm" color="coolGray.500">
					Agrega informacion que te parezca util.
				</Text>
				<TextArea
					onChangeText={v => setFormData({ ...formData, descripcion: v })}
					value={formData.descripcion}
					autoCompleteType="none"
					isInvalid={'descripcion' in errors}
				/>
				<Text fontSize="xs" color="red.500">
					{errors.descripcion}
				</Text>

				<Text fontSize="sm" color="coolGray.500">
					Selecciona cómo va a ser entregado
				</Text>
				<Text fontSize="xs" color="gray.400" mt={1}>
					Indica las características que se asemejen a cómo entregas el residuo
					para que los recicladores lo tengan en cuenta.
				</Text>
				<Checkbox.Group
					colorScheme="green"
					defaultValue={selectedEntregado}
					accessibilityLabel="Elegi las caracteristicas que se asemejen mas a la manera en la que vas a entregar tu residuo."
					onChange={values => setSelectedEntregado(values || [])}
				>
					<Checkbox value="0" my={1}>
						Embalado en caja
					</Checkbox>
					<Checkbox value="1" my={1}>
						Embalado en bolsa
					</Checkbox>
					<Checkbox value="2" my={1}>
						Compacto
					</Checkbox>
					<Checkbox value="3" my={1}>
						Mojado/Humedo
					</Checkbox>
					<Checkbox value="4" my={1}>
						Pesa mas de 5kg
					</Checkbox>
				</Checkbox.Group>
				<FormControl.ErrorMessage _text={{ fontSize: 'xs' }}>
					{errors.entrega}
				</FormControl.ErrorMessage>
			</FormControl>
			<FormControl>
				<FormControl.Label>Fecha limite de retiro</FormControl.Label>
				<Input
					onFocus={() => {
						setShowDatePicker(true)
						Keyboard.dismiss()
					}}
					value={formatDate(formData.fechaLimite)}
					editable={false}
				/>
			</FormControl>
			<FormControl>
				<FormControl.Label>Agrega una imagen</FormControl.Label>
				<View
					style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
				>
					<Button onPress={pickImage}>Tomar foto</Button>
					{image && (
						<View style={{ borderWidth: 2, borderColor: 'green', padding: 5, marginTop: 5, borderRadius: 5}} >
							<Image
								source={{ uri: 'data:image/jpeg;base64,' + image }}
								style={{ width: 200, height: 200 }}
							/>
						</View>
					)}
				</View>
			</FormControl>
			<Button mt="5" onPress={doSubmit} isLoading={loading}>
				{r?.id ? 'Editar' : 'Crear'}
			</Button>
		</>
	)
}

/*

MODAL QUE FUNCIONA OK EN IOS

const onChangeDate = (event, selected) => {
		const currentDate = selected || formData.fechaLimite
		setSelectedDate(currentDate)
	}

	const handleSetDate = () => {
		setShowDatePicker(false)
		setData({ ...formData, fechaLimite: selectedDate })
	}

{showDatePicker && (
	<Modal isOpen={showDatePicker} onClose={() => setShowDatePicker(false)}>
		<Modal.Content>
			<Modal.CloseButton />
			<Modal.Header alignItems="center">
				<Text bold fontSize="xl">
					Selecciona fecha limite
				</Text>
			</Modal.Header>
			<Modal.Body>
				<View style={{ flex: 1, justifyContent: 'flex-end' }}>
					<DateTimePicker
						value={selectedDate || new Date()}
						mode="date"
						display="inline"
						minimumDate={new Date()}
						onChange={onChangeDate}
					/>
					<Button onPress={() => handleSetDate()}> ok </Button>
				</View>
			</Modal.Body>
		</Modal.Content>
	</Modal>
)}
*/
