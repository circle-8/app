import React from 'react'
import { Box, Center, VStack, Text } from 'native-base'
import { AuthContext } from '../../../context/auth.context'
import { UserService } from '../../../services/user.service'
import { PuntoService } from '../../../services/punto.service'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ProfileRoutes, ProfileRoutesParams } from '../../../constants/routes'
import { PuntoResiduo, User } from '../../../services/types'
import { TouchableOpacity } from 'react-native'

type Props = NativeStackScreenProps<ProfileRoutesParams, 'Profile'>

export const Profile = ({navigation}: Props) => {
	const { logout } = React.useContext(AuthContext)
	const [user, setUser] = React.useState<User>()

	const onLogout = async () => {
		await UserService.logout()
		logout()
	}

	const onEditPuntoResiduo = async () => {
		const user = await UserService.getCurrent()
		const points = await PuntoService.getAll({
			tipos: ['RESIDUO'],
			ciudadanoId: user.ciudadanoId
		})

		// Si no tiene puntos de residuos, ir directo a crear uno
		navigation.navigate(ProfileRoutes.editPuntoResiduo, {
			ciudadanoId: user.ciudadanoId,
			punto: points[0] as PuntoResiduo
		})
	}

	const onEditPerfil = async () => {
		const user = await UserService.getCurrent()

		navigation.navigate(ProfileRoutes.editPerfil, {
			userId: user.id,
		})
	}

	const loadInitialData = async () => {
		const user = await UserService.getCurrent()
		setUser(user)
	}

	React.useEffect(() => {
		const unsubscribeFocus = navigation.addListener('focus', () => {
			loadInitialData()
		})

		return unsubscribeFocus
	}, [navigation])

	return (
		<Center w="100%" mt="10">
			<Box>
				<Text fontSize="lg" fontWeight="bold" textAlign="center">
					¡Bienvenido {user?.nombre}!
				</Text>
			</Box>
			<VStack mt="4" width="80%" alignSelf="center">
			<TouchableOpacity
					style={{
						backgroundColor: '#6C796A',
						padding: 20,
						marginBottom: 10,
						alignItems: 'center',
						width: '100%',
					}}
					onPress={onEditPerfil}
				>
					<Text style={{ color: 'white', textAlign: 'center' }}>
						Editar perfil
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={{
						backgroundColor: '#6C796A',
						padding: 20,
						marginBottom: 10,
						alignItems: 'center',
						width: '100%',
					}}
					onPress={onEditPuntoResiduo}
				>
					<Text style={{ color: 'white', textAlign: 'center' }}>
						Punto de retiro de residuos
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={{
						backgroundColor: '#6C796A',
						padding: 20,
						alignItems: 'center',
						width: '100%',
					}}
					onPress={onLogout}
				>
					<Text style={{ color: 'white', textAlign: 'center' }}>
						Cerrar Sesión
					</Text>
				</TouchableOpacity>
			</VStack>
		</Center>
	)
}
