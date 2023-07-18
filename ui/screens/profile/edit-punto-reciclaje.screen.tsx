import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Text } from 'native-base'
import React from 'react'
import { ProfileRoutesParams } from '../../../constants/routes'

type Props = NativeStackScreenProps<ProfileRoutesParams, 'EditPuntoReciclaje'>

export const EditPuntoReciclaje = ({ navigation }: Props) => {
	return <Text onPress={() => navigation.goBack()}>EditPuntoReciclaje</Text>
}
