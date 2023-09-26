import React from 'react'
import {
	Box,
	Button,
	Center,
	Checkbox,
	FormControl,
	Heading,
	Input,
	ScrollView,
	VStack,
	useToast,
} from 'native-base'
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack'
import { ProfileRoutes, ProfileRoutesParams } from '../../../constants/routes'
import { LoadingScreen } from '../../components/loading.component'
import { match } from '../../../utils/either'
import { UserService } from '../../../services/user.service'
import { User } from '../../../services/types'

type Props = NativeStackScreenProps<ProfileRoutesParams, 'EditPerfil'>

export const EditPerfil = ({ navigation, route }: Props) => {
	const [isLoading, setLoading] = React.useState(true)
    const [user, setUser] = React.useState<User>()
	const toast = useToast()
	const userId = route.params?.userId

	const loadInitialData = async () => {
        const user = await UserService.get('/user/' + userId)

        match(
			user,
			t => {
                setUser(t)
			},
			err => {
				toast.show({ description: 'Ocurrio un error al obtener el usuario.', })
                navigation.navigate(ProfileRoutes.profile) 
			},
		)
		setLoading(false)
	}

	React.useEffect(() => {
		const unsubscribeFocus = navigation.addListener('focus', () => {
			loadInitialData()
		})

		return unsubscribeFocus
	}, [navigation])

	if (isLoading) {
		return <LoadingScreen />
	}

	return (
		<ScrollView>
			<Center w="100%">
				<Box safeArea p="2" py="5" w="90%" maxW="290">
					<Heading size="lg" fontWeight="600" color="coolGray.800" alignSelf="center"
						_dark={{
							color: 'warmGray.50',
						}}
					>
						Edita tu perfil
					</Heading>
					<VStack space={3} mt="5">
						<Form userId={user.id} usuario={user.username} name={user.nombre} mail={user.email} transportista={user.transportistaId ? true : false} navigation={navigation}/>
					</VStack>
				</Box>
			</Center>
		</ScrollView>
	)
}

type FormState = {
    id?: number
	username?: string
	nombre?: string
	email?: string
}

type Errors = {
	has: boolean
	username?: string
	nombre?: string
	email?: string
}

const Form = ({
    userId,
    usuario,
	name,
	mail,
    transportista,
    navigation,
}: {
    userId?: number
    usuario?: string
	name?: string
	mail?: string
    transportista?: boolean
    navigation: NativeStackNavigationProp<ProfileRoutesParams>
}) => {
	const [formData, setData] = React.useState<FormState>({
        id: userId,
        username: usuario,
        nombre: name,
        email: mail
    })
	const [isTransportista, setTransportista] = React.useState<boolean>(transportista)
	const [errors, setErrors] = React.useState<Errors>({ has: false })
	const [loading, setLoading] = React.useState(false)
	const toast = useToast()

	const isValid = () => {
		const newErrors: Errors = { has: false }
		if (!formData.username) {
			newErrors.has = true
			newErrors.username = 'Usuario no puede estar vacío'
		}
		if (!formData.email) {
			newErrors.has = true
			newErrors.email = 'Dirección de e-mail no puede estar vacío'
		}
		if (!formData.nombre) {
			newErrors.has = true
			newErrors.nombre = 'Nombre y Apellido no puede estar vacío'
		}

		setErrors(newErrors)
		return !newErrors.has
	}
	const onSubmit = async () => {
		setLoading(true)
		if (isValid()) {
			const res = await UserService.put({ ...formData, isTransportista })
			match(
				res,
				async usr => {
					toast.show({ description: '¡Perfil modificado con exito!' })
                    UserService.saveLoggedUser(usr)
                    navigation.navigate(ProfileRoutes.profile) 
				},
				err => toast.show({ description: err })
			)
		}

		setLoading(false)
	}

	return (
		<>
			<FormControl isRequired isInvalid={'username' in errors}>
				<FormControl.Label>Usuario</FormControl.Label>
				<Input
                    value={formData.username}
					autoCapitalize="none"
					onChangeText={v => setData({ ...formData, username: v })}
				/>
				<FormControl.ErrorMessage _text={{ fontSize: 'xs' }}>
					{errors.username}
				</FormControl.ErrorMessage>
			</FormControl>
			<FormControl isRequired isInvalid={'nombre' in errors}>
				<FormControl.Label>Nombre y Apellido</FormControl.Label>
				<Input
                    value={formData.nombre}
					autoCapitalize="words"
					onChangeText={v => setData({ ...formData, nombre: v })}
				/>
				<FormControl.ErrorMessage _text={{ fontSize: 'xs' }}>
					{errors.nombre}
				</FormControl.ErrorMessage>
			</FormControl>
			<FormControl isRequired isInvalid={'email' in errors}>
				<FormControl.Label>Dirección de e-mail</FormControl.Label>
				<Input
                    value={formData.email}
					autoCapitalize="none"
					onChangeText={v => setData({ ...formData, email: v })}
				/>
				<FormControl.ErrorMessage _text={{ fontSize: 'xs' }}>
					{errors.email}
				</FormControl.ErrorMessage>
			</FormControl>
			<FormControl>
				<FormControl.Label>Quiero ser transportista</FormControl.Label>
				<Checkbox
					value={'true'}
					accessibilityLabel="Quiero ser transportista"
					onChange={v => setTransportista(v)}
                    isChecked={isTransportista}
					size="lg"
				/>
			</FormControl>
			<Button
				mt="10"
				onPress={onSubmit}
				isLoading={loading}
			>
				Editar
			</Button>
		</>
    )
}
