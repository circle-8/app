import { Http } from '../api/api'
import { Either, map } from '../utils/either'
import { ListResponse, TransaccionResponse } from './responses'
import { ErrorMessage, Transaccion } from './types'

type Filter = {
	ciudadanoId?: string
    //TODO creo el filtro por si queremos filtrar por mas cosas en un futuro
}

const getAll = async (f: Filter): Promise<Either<Transaccion[], ErrorMessage>> => {
	let url = '/transacciones?'
	if (f.ciudadanoId) url += 'ciudadano_id=' + f.ciudadanoId

	const res = await Http.get<ListResponse<TransaccionResponse>>(url)
	return map(
		res,
		p => p.data,
		err => err.message,
	)
}

const putTransaccion = async (id: number, id_residuo: number)=> {
	const res = await Http.put<TransaccionResponse>(`/transaccion/${id}/residuo/${id_residuo}`)
	return map(
		res,
		p => p,
		err => err.message,
	)
}

const postTransaccion = async (ptoReciclajeId: number)=> {
    const body = {
        punto_reciclaje: ptoReciclajeId,
      };
    const res = await Http.post<TransaccionResponse>(`/transaccion`, body)
	return map(
		res,
		p => p,
		err => err.message,
	)
}

export const TransaccionService = {
	getAll,
	putTransaccion,
    postTransaccion,
}