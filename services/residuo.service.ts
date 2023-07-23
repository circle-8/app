import { Http } from '../api/api'
import { Either, map } from '../utils/either'
import { ResiduoResponse } from './responses'
import { ErrorMessage, Residuo } from './types'

type ResiduoSave = {
	tipoResiduoId: number
	ciudadanoId: number
	puntoResiduoId: number
	descripcion: string
	fechaLimiteRetiro?: string
}

const save = async (r: ResiduoSave): Promise<Either<Residuo, ErrorMessage>> => {
	console.log(r)
	const url = '/residuo'
	const res = await Http.post<ResiduoResponse>(url, r)
	return map(
		res,
		rr => ({ ...rr, createdAt: new Date(rr.fechaCreacion) }),
		err => err.message,
	)
}

export const ResiduoService = {
	save,
}
