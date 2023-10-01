import React from 'react'
import { Avatar, Box, Center, FlatList, HStack, Heading, Spacer, Text, VStack, useToast } from 'native-base'
import { Conversacion } from '../../../services/types';
import { LoadingScreen } from '../../components/loading.component';
import { ChatService } from '../../../services/chat.service';
import { UserService } from '../../../services/user.service';
import { MessageRouteParams, MessageRoutes } from '../../../constants/routes';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { match } from '../../../utils/either';
import { TouchableOpacity } from 'react-native'

type Props = NativeStackScreenProps<MessageRouteParams, 'Messages'>

export const Messages = ({ navigation }: Props) => {
	const [userId, setUserId] = React.useState<number>()
	const [conversaciones, setConversaciones] = React.useState<Conversacion[]>([])
	const [isLoading, setLoading] = React.useState(true)
	const toast = useToast()

	const initialLoad = async () => {
		const user = await UserService.getCurrent()
		setUserId(user.id)

		const res = await ChatService.getConversaciones(user.id)
		match(
			res,
			c => setConversaciones(c),
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
					Conversaciones activas
				</Heading>
				<FlatList
					data={conversaciones}
					renderItem={({ item }) => (
						<TouchableOpacity onPress={() => navigation.navigate(MessageRoutes.chats, {
							titulo: item.titulo,
							userId: userId,
							chatUri: item.chatsUri
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
