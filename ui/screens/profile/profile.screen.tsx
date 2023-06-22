import React from 'react'
import { Box, Button, Center, VStack } from 'native-base'
import { AuthContext } from '../../../context/auth.context'
import { UserService } from '../../../services/user.service'

export const Profile = () => {
	const { logout } = React.useContext(AuthContext)
	const onLogout = async () => {
		await UserService.logout()
		logout()
	}

	return (
		<Center w="100%">
			<Box>Profile</Box>
			<Button mt="2" colorScheme="indigo" onPress={onLogout}>Cerrar Sesión</Button>
		</Center>
	);
}
