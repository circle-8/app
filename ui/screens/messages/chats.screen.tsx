import React from 'react'
import { Avatar, Box, Center, FlatList, HStack, Heading, Spacer, Text, VStack, useToast } from 'native-base'
import { Chat } from '../../../services/types';
import { LoadingScreen } from '../../components/loading.component';
import { ChatService } from '../../../services/chat.service';
import { MessageRouteParams, MessageRoutes } from '../../../constants/routes';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { match } from '../../../utils/either';
import { TouchableOpacity } from 'react-native';

type Props = NativeStackScreenProps<MessageRouteParams, 'Chats'>

export const Chats = ({ navigation, route }: Props) => {
	navigation.setOptions({title: route.params.titulo})
	const uri = route.params.chatUri
	const userId = route.params.userId

	const [isLoading, setLoading] = React.useState(true)
	const [chats, setChats] = React.useState<Chat[]>([])
	const toast = useToast()

	const initialLoad = async () => {
		const res = await ChatService.getChats(uri)
		match(
			res,
			c => setChats(c),
			err => {
				toast.show({ description: err })
				navigation.goBack()
			},
		)

		setLoading(false)
	}

	React.useEffect(() => { initialLoad() }, [])

	if ( isLoading ) {
		return <LoadingScreen/>
	}

	return (
		<Center w="100%">
			<Box width="80%">
				<Heading fontSize="xl" p="4" pb="3">
					Chats
				</Heading>
				<FlatList
					data={chats}
					renderItem={({ item }) => (
						<TouchableOpacity onPress={() => navigation.navigate(MessageRoutes.chat, {
							titulo: item.titulo,
							userId: userId,
							historyUri: item.chatHistoryUri,
							actionsUri: item.actionsUri,
							wsUri: item.chatWs
						})}>
							<Box
								borderBottomWidth="1"
								_dark={{
									borderColor: 'muted.50',
								}}
								borderColor="muted.800"
								pl={['0', '4']}
								pr={['0', '5']}
								py="2"
							>
								<HStack space={[2, 3]} justifyContent="space-between">
									<Avatar
										size="48px"
										color="black"
									/>
									<VStack>
										<Text
											_dark={{
												color: 'warmGray.50',
											}}
											color="coolGray.800"
											bold
										>
											{item.titulo}
										</Text>
										<Text
											color="coolGray.600"
											_dark={{
												color: 'warmGray.200',
											}}
										>
											{item.descripcion}
										</Text>
									</VStack>
									<Spacer />
									<Text
										fontSize="xs"
										_dark={{
											color: 'warmGray.50',
										}}
										alignSelf="flex-start"
										color={item.newMessages ? 'green.600' : 'coolGray.800'}
									>
										{item.timestamp}
									</Text>
									{item.newMessages && (
										<Text color="green.600" marginRight="4px">
											●
										</Text>
									)}
								</HStack>
							</Box>
						</TouchableOpacity>
					)}
					keyExtractor={item => item.id}
				/>
			</Box>
		</Center>
	)
}
