import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button, Text } from 'native-base'
import React from 'react'
import { ProfileRoutes, ProfileRoutesParams } from '../../../constants/routes'

type Props = NativeStackScreenProps<ProfileRoutesParams, 'ListPuntoReciclaje'>

export const ListPuntoReciclaje = ({ navigation }: Props) => {
	return <Button onPress={() => navigation.navigate(ProfileRoutes.editPuntoReciclaje)}>Edit</Button>
}
