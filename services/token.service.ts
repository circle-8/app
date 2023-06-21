import AsyncStorage from '@react-native-async-storage/async-storage'

export type TokenType = 'access' | 'refresh'

const set = async (typ: TokenType, token: string) => {
	await AsyncStorage.setItem(typ, token)
}

const get = async (typ: TokenType): Promise<string|null> => {
	return await AsyncStorage.getItem(typ)
}

export const TokenService = {
	set,
	get,
}
