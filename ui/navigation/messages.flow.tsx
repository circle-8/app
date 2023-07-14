import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Messages } from '../screens/messages/messages.screen'

const MessagesStack = createNativeStackNavigator()

export const MessagesFlow = () => {
	return (
		<MessagesStack.Navigator>
			<MessagesStack.Screen name="Messages" component={Messages} options={{title: 'Mensajes'}}/>
		</MessagesStack.Navigator>
	)
}
