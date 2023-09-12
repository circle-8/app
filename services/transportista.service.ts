import { Http } from '../api/api'
import { Either, Maybe, map, mapRight, maybeRight } from '../utils/either'
import { ListResponse, TransporteResponse } from './responses'
import { ErrorMessage, Transporte } from './types'

type Filter = {
	userId?: number
    sinTransportista?: boolean
    entregaConfirmada?: boolean
}

const getAll = async (
	f: Filter,
): Promise<Either<Transporte[], ErrorMessage>> => {
	let url = '/transportes?expand=transaccion&'
	if (f.userId) url += 'user_id=' + f.userId
    if (f.sinTransportista !== null) url += '&solo_sin_transportista=' + f.sinTransportista
    if (f.entregaConfirmada !== null) url += '&entrega_confirmada=' + f.entregaConfirmada

	const res = await Http.get<ListResponse<TransporteResponse>>(url)
	return map(
		res,
		p => p.data,
		err => err.message,
	)
}

const tomarTransporte = async(id: number, idTransportista: number): Promise<Either<Transporte, ErrorMessage>> => {
	const body = {
		transportistaId: idTransportista
	}
	const res = await Http.put<TransporteResponse>(`/transporte/${id}`, body)
	return map(
		res,
		p => p,
		err => err.message
	)
}

const iniciarTransporte = async(id: number): Promise<Either<Transporte, ErrorMessage>> => {
	const res = await Http.post<TransporteResponse>(`/transporte/${id}/inicio`)
	return map(
		res,
		p => p,
		err => err.message
	)
}

export const TransportistaService = {
	getAll,
	tomarTransporte,
	iniciarTransporte,
}
