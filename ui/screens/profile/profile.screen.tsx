import React from 'react'
import { Box, Button, Center, VStack } from 'native-base'
import { AuthContext } from '../../../context/auth.context'
import { UserService } from '../../../services/user.service'
import { PuntoService } from '../../../services/punto.service'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ProfileRoutes, ProfileRoutesParams, TabRoutes } from '../../../constants/routes'
import { PuntoResiduo } from '../../../services/types'

type Props = NativeStackScreenProps<ProfileRoutesParams, 'Profile'>

export const Profile = ({navigation}: Props) => {
	const { logout } = React.useContext(AuthContext)

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

	return (
		<Center w="100%">
			<Box>Profile</Box>
			<Button mt="2" color='primary' onPress={onEditPuntoResiduo}>
				Punto de retiro de residuos
			</Button>
			<Button mt="2" color='primary' onPress={onLogout}>
				Cerrar Sesión
			</Button>
		</Center>
	)
}
