import { Http } from '../api/api'
import { Either, map } from '../utils/either'
import {
	ActionResponse,
	ChatResponse,
	ConversacionResponse,
	ListResponse,
	MessageResponse,
} from './responses'
import { Action, Chat, Conversacion, ErrorMessage } from './types'

const getConversaciones = async (
	userId: number,
): Promise<Either<Conversacion[], ErrorMessage>> => {
	const url = `/user/${userId}/conversaciones`
	const res = await Http.get<ListResponse<ConversacionResponse>>(url)
	return map(
		res,
		c => c.data,
		err => err.message,
	)
}

const getChats = async (url: string): Promise<Either<Chat[], ErrorMessage>> => {
	const res = await Http.get<ListResponse<ChatResponse>>(url)
	return map(
		res,
		c => c.data,
		err => err.message,
	)
}

const getHistory = async (
	url: string,
): Promise<Either<MessageResponse[], ErrorMessage>> => {
	const res = await Http.get<ListResponse<MessageResponse>>(url)
	return map(
		res,
		c => c.data,
		err => err.message,
	)
}

const getActions = async (
	url: string,
): Promise<Either<Action[], ErrorMessage>> => {
	const res = await Http.get<ListResponse<ActionResponse>>(url)
	return map(
		res,
		c => c.data,
		err => err.message,
	)
}

export const ChatService = {
	getConversaciones,
	getChats,
	getHistory,
	getActions,
}
