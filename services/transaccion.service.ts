import { Http } from '../api/api'
import { Either, Maybe, map, mapRight, maybeRight } from '../utils/either'
import { ListResponse, TransaccionResponse } from './responses'
import { ErrorMessage, Transaccion } from './types'

type Filter = {
	ciudadanoId?: number
	//TODO creo el filtro por si queremos filtrar por mas cosas en un futuro
}

const getAll = async (
	f: Filter,
): Promise<Either<Transaccion[], ErrorMessage>> => {
	let url = '/transacciones?expand=transporte&expand=residuos&'
	if (f.ciudadanoId) url += 'ciudadano_id=' + f.ciudadanoId

	const res = await Http.get<ListResponse<TransaccionResponse>>(url)
	return map(
		res,
		p => p.data,
		err => err.message,
	)
}

const get = async (id: number): Promise<Either<Transaccion, ErrorMessage>> => {
	const res = await Http.get<TransaccionResponse>(
		`/transaccion/${id}?expand=residuos&expand=punto_reciclaje`,
	)
	return map(
		res,
		p => p,
		err => err.message,
	)
}

const addResiduo = async (id: number, id_residuo: number) => {
	const res = await Http.put<TransaccionResponse>(
		`/transaccion/${id}/residuo/${id_residuo}`,
	)
	return map(
		res,
		p => p,
		err => err.message,
	)
}

const deleteResiduo = async (
	id: number,
	idResiduo: number,
): Promise<Maybe<ErrorMessage>> => {
	const res = await Http.delete<null>(`/transaccion/${id}/residuo/${idResiduo}`)
	return maybeRight(mapRight(res, err => err.message))
}

const createTransaccion = async (ptoReciclajeId: number, residuoId: number, id:number) => {
	const body = {
		puntoReciclaje: ptoReciclajeId,
		residuoId: [residuoId],
		solicitudId: id
	}
	const res = await Http.post<TransaccionResponse>('/transaccion', body)
	return map(
		res,
		p => p,
		err => err.message,
	)
}

const fulfill = async(id: number): Promise<Either<Transaccion, ErrorMessage>> => {
	const body = {
		fechaRetiro: new Date().toISOString()
	}
	const res = await Http.put<TransaccionResponse>(`/transaccion/${id}`, body)
	return map(
		res,
		p => p,
		err => err.message
	)
}

const solicTransporte = async(id: number): Promise<Either<Transaccion, ErrorMessage>> => {
	const res = await Http.post<TransaccionResponse>(`/transaccion/${id}/transporte`)
	return map(
		res,
		p => p,
		err => err.message
	)
}

const deleteSolicTransporte = async(id: number): Promise<Either<Transaccion, ErrorMessage>> => {
	const res = await Http.delete<TransaccionResponse>(`/transaccion/${id}/transporte`)
	return map(
		res,
		p => p,
		err => err.message
	)
}

export const TransaccionService = {
	getAll,
	get,
	addResiduo,
	deleteResiduo,
	createTransaccion,
	fulfill,
	solicTransporte,
	deleteSolicTransporte
}
