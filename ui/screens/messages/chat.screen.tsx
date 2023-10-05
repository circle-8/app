import React from 'react'
import {
	Avatar,
	Box,
	Center,
	FlatList,
	HStack,
	Heading,
	Modal,
	ScrollView,
	Spacer,
	Text,
	VStack,
	View,
	useToast,
} from 'native-base'
import { Action, Chat } from '../../../services/types'
import { LoadingScreen } from '../../components/loading.component'
import { ChatService } from '../../../services/chat.service'
import { MessageRouteParams, MessageRoutes } from '../../../constants/routes'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { match } from '../../../utils/either'
import { BackHandler, FlexAlignType, ListRenderItem, ListRenderItemInfo, TextInput, TouchableOpacity } from 'react-native'
import {
	Component,
	ComponentMessage,
	IMessage,
	Message,
	MessageResponse,
} from '../../../services/responses'
import { Container, Button, Icon, Input } from 'native-base'
import { Ionicons } from '@expo/vector-icons'

type Props = NativeStackScreenProps<MessageRouteParams, 'Chat'>

export const ChatScreen = ({ navigation, route }: Props) => {
	const historyUri = route.params.historyUri
	const actionsUri = route.params.actionsUri
	const wsUri = route.params.wsUri
	const userId = route.params.userId
	const toast = useToast()

	const [isLoading, setLoading] = React.useState(true)

	const [message, setMessage] = React.useState<string>('')
	const [component, setComponent] = React.useState<ComponentMessage>()
	const [messages, setMessages] = React.useState<MessageResponse[]>([])
	const [ws, setWs] = React.useState<WebSocket>()
	const flatListRef = React.useRef<any>(null)

	const [actions, setActions] = React.useState<Action[]>([])

	const handleIncomingMessage = (message: MessageResponse) => {
		switch ( message.type ) {
			case 'MESSAGE':
				setMessages(prev => [...prev, message])
		}
	}

	const initialLoad = async () => {
		navigation.setOptions({ title: route.params.titulo })

		const ws = new WebSocket("wss://circle8.germanmerkel.com.ar" + wsUri)
		ws.onmessage = msg => {
			const data : MessageResponse = JSON.parse(msg.data)
			handleIncomingMessage(data)
		}
		setWs(ws)

		const res = await ChatService.getHistory(historyUri)
		match(
			res,
			c => {
				setMessages(c.filter(
					c =>
						c.type === 'MESSAGE' ||
						(c.type === 'COMPONENT' &&
							(c.message as ComponentMessage).type === 'MESSAGE'),
				))
				setComponent(
					c.filter(c => c.type === 'COMPONENT')[0]?.message as ComponentMessage,
				)
			},
			err => {
				toast.show({ description: err })
				navigation.goBack()
			},
		)

		const actionsRes = await ChatService.getActions(actionsUri)
		match(
			actionsRes,
			c => setActions(c),
			err => {
				toast.show({ description: err })
				navigation.goBack()
			},
		)

		setLoading(false)
	}


	React.useEffect(() => {
		initialLoad()
		return () => {
			if ( ws ) ws.close()
		}
	}, [])
	React.useEffect(() => {
		flatListRef.current?.scrollToEnd({ animated: true })
	}, [messages])

	if (isLoading) {
		return <LoadingScreen />
	}

	const sendMessage = () => {
		if (message.trim() !== '') {
			ws.send(JSON.stringify({
				type: "MESSAGE",
				message: message
			}))
			// setMessages(prev => [...prev, {
			// 	message: { message: message, color: 'primary' },
			// 	from: userId,
			// 	to: 1, // TODO
			// 	type: 'MESSAGE',
			// 	timestamp: new Date().toISOString(),
			// }])
			setMessage('')
		}
	}

	const renderMessage = (message: MessageResponse) => {
		switch (message.type) {
			case 'MESSAGE':
				return <Text>{(message.message as Message).message}</Text>
			case 'COMPONENT':
				return buildComponentMessage(message.message as ComponentMessage)
		}
	}

	const buildComponentMessage = (m: ComponentMessage) => {
		return (
			<Box>
				{m.components
					.filter(c => c.type === 'TEXT')
					.map((c, idx) => (
						<Text key={idx.toString()}>{c.text}</Text>
					))}
				<Center flex={1}>
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
						}}
					>
						{m.components.filter(c => c.type === 'BUTTON').map(renderComponent)}
					</View>
				</Center>
			</Box>
		)
	}

	const renderMessageItem = ({ item, index }: ListRenderItemInfo<MessageResponse>) => {
		let color: string
		let align: FlexAlignType
		if (item.type === 'MESSAGE') {
			const colorMessage = (item.message as Message).color
			if (colorMessage === 'primary')
				color = item.from === userId ? '#DCF8C6' : '#EAEAEA'

			align = item.from === userId ? 'flex-end' : 'flex-start'
		} else {
			color = '#007BFF'
			align = 'center'
		}

		return (
			<View
				style={{
					alignSelf: align,
					backgroundColor: color,
					padding: 8,
					margin: 1,
					borderRadius: 8,
					maxWidth: '80%',
				}}
				key={index.toString()}
			>
				{renderMessage(item)}
				<Text style={{ fontSize: 10, color: '#777' }}>
					{new Date(item.timestamp).toLocaleString()}
				</Text>
			</View>
		)
	}

	const renderComponent = (c: Component, idx: number) => {
		switch (c.type) {
			case 'TITLE':
				return (
					<Text key={idx.toString()} bold fontSize="xl">
						{c.text}
					</Text>
				)
			case 'TEXT':
				return <Text key={idx.toString()}>{c.text}</Text>
			case 'INPUT':
				return (
					<Input
						key={c.name}
						keyboardType={c.inputType === 'NUMBER' ? 'numeric' : 'default'}
						placeholder={c.text}
					/>
				)
			case 'BUTTON':
				return (
					<Button
						key={c.action.send.type}
						style={{ marginHorizontal: 3 }}
						onPress={() => {}}
					>
						{c.text}
					</Button>
				)
		}
	}

	const buildHeader = (titles: Component[]) => {
		return (
			<Modal.Header alignItems="center">
				{titles.map(renderComponent)}
			</Modal.Header>
		)
	}

	const buildBody = (bodyParts: Component[]) => {
		return <Modal.Body>{bodyParts.map(renderComponent)}</Modal.Body>
	}

	const buildFooter = (footerParts: Component[]) => {
		return (
			<Modal.Footer>
				<Center flex={1}>
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
						}}
					>
						{footerParts.map(renderComponent)}
					</View>
				</Center>
			</Modal.Footer>
		)
	}

	const renderModal = (components: Component[]) => {
		return (
			<Modal isOpen={true} size="lg">
				<Modal.Content>
					{buildHeader(components.filter(c => c.type === 'TITLE'))}
					{buildBody(
						components.filter(c => c.type === 'TEXT' || c.type === 'INPUT'),
					)}
					{buildFooter(components.filter(c => c.type === 'BUTTON'))}
				</Modal.Content>
			</Modal>
		)
	}

	return (
		<Box style={{ flex: 1, justifyContent: 'space-between' }}>
			{!!component && renderModal(component.components)}
			<FlatList
				style={{
					padding: 5,
				}}
				ref={flatListRef}
				data={messages}
				keyExtractor={(item, index) => index.toString()}
				renderItem={renderMessageItem}
			/>
			<VStack>
				<ScrollView
					style={{ flexDirection: 'row', margin: 2 }}
					horizontal
					showsHorizontalScrollIndicator={false}
				>
					{actions
						.filter(a => a.type === 'ACTION')
						.map((a, idx) => (
							<Button
								style={{ margin: 3, padding: 5 }}
								size="sm"
								key={idx.toString()}
								onPress={() => {}}
							>
								{a.titulo}
							</Button>
						))}
				</ScrollView>
				<Box
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						margin: 5,
						marginTop: 1,
					}}
				>
					<TextInput
						style={{
							flex: 1,
							borderWidth: 1,
							borderColor: '#ccc',
							borderRadius: 20,
							padding: 10,
						}}
						placeholder="Mensaje"
						value={message}
						onChangeText={text => setMessage(text)}
					/>
					<Button
						style={{
							borderRadius: 20,
						}}
						onPress={sendMessage}
					>
						<Ionicons name="send" size={24} color="white" />
					</Button>
				</Box>
			</VStack>
		</Box>
	)
}
