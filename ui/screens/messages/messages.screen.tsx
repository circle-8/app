import React from 'react'
import { Avatar, Box, Center, FlatList, HStack, Heading, Spacer, Text, VStack } from 'native-base'

export const Messages = () => {

	const data = [{
		id: "bd7acbea-c1b1-46c2-aed5-3ad53abb28ba",
		fullName: "German Lopez",
		timeStamp: "12:47 PM",
		recentText: "Dale, yo los retiro!",
		avatarUrl: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
		isNewMessage: true
	  }, {
		id: "3ac68afc-c605-48d3-a4f8-fbd91aa97f63",
		fullName: "Monica Perez",
		timeStamp: "11:11 PM",
		recentText: "El lunes paso.",
		avatarUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyEaZqT3fHeNrPGcnjLLX1v_W4mvBlgpwxnA&usqp=CAU",
		isNewMessage: true
	  }, {
		id: "58694a0f-3da1-471f-bd96-145571e29d72",
		fullName: "Andres Nadal",
		timeStamp: "6:22 PM",
		recentText: "Cuantos kgs aprox?",
		avatarUrl: "https://miro.medium.com/max/1400/0*0fClPmIScV5pTLoE.jpg",
		isNewMessage: false
	  }, {
		id: "68694a0f-3da1-431f-bd56-142371e29d72",
		fullName: "Fabio Rivolta",
		timeStamp: "8:56 PM",
		recentText: "dale, gracias!",
		avatarUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSr01zI37DYuR8bMV5exWQBSw28C1v_71CAh8d7GP1mplcmTgQA6Q66Oo--QedAN1B4E1k&usqp=CAU",
		isNewMessage: false
	  }, {
		id: "28694a0f-3da1-471f-bd96-142456e29d72",
		fullName: "Kiara Gutierrez",
		timeStamp: "12:47 PM",
		recentText: "dale, te aviso.",
		avatarUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBwgu1A5zgPSvfE83nurkuzNEoXs9DMNr8Ww&usqp=CAU",
		isNewMessage: false
	  }];


	return (
		<Center w="100%">
			<Box width="80%">
				<Heading fontSize="xl" p="4" pb="3">
					Conversaciones activas
				</Heading>
				<FlatList
					data={data}
					renderItem={({ item }) => (
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
									source={{
										uri: item.avatarUrl,
									}}
								/>
								<VStack>
									<Text
										_dark={{
											color: 'warmGray.50',
										}}
										color="coolGray.800"
										bold
									>
										{item.fullName}
									</Text>
									<Text
										color="coolGray.600"
										_dark={{
											color: 'warmGray.200',
										}}
									>
										{item.recentText}
									</Text>
								</VStack>
								<Spacer />
								<Text
									fontSize="xs"
									_dark={{
										color: 'warmGray.50',
									}}
									alignSelf="flex-start"
									color={item.isNewMessage ? 'green.600' : 'coolGray.800'}
								>
									{item.timeStamp}
								</Text>
								{item.isNewMessage && (
									<Text color="green.600" marginRight="4px">
										●
									</Text>
								)}
							</HStack>
						</Box>
					)}
					keyExtractor={item => item.id}
				/>
			</Box>
		</Center>
	)
}
