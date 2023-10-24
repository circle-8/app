import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Messages } from '../screens/messages/messages.screen'
import { MessageRoutes } from '../../constants/routes'
import { Chats } from '../screens/messages/chats.screen'
import { ChatScreen } from '../screens/messages/chat.screen'

const MessagesStack = createNativeStackNavigator()

export const MessagesFlow = () => {
	return (
		<MessagesStack.Navigator>
			<MessagesStack.Screen
				name={MessageRoutes.messages}
				component={Messages}
				options={{ title: 'Mensajes' }}
			/>
			<MessagesStack.Screen
				name={MessageRoutes.chats}
				component={Chats}
				options={{ title: 'Chats' }}
			/>
			<MessagesStack.Screen
				name={MessageRoutes.chat}
				component={ChatScreen}
				options={{ title: 'Chat' }}
			/>
		</MessagesStack.Navigator>
	)
}
