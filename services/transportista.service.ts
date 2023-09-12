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

export const TransportistaService = {
	getAll,
}
