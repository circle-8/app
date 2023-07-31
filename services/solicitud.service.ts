import { Http } from '../api/api'
import { Either, map } from '../utils/either'
import { ListResponse, SolicitudResponse } from './responses'
import { ErrorMessage, Solicitud } from './types'

const getAll = async (ciudadanoId): Promise<Either<Solicitud[], ErrorMessage>> => {
	const res = await Http.get<ListResponse<SolicitudResponse>>(`/solicitudes?expand=residuo&expand=ciudadanos&solicitante_id=${ciudadanoId}`)
	return map(
		res,
		p => p.data,
		err => err.message,
	)
}

const cancelarSolicitud = async (id, canceladorId)=> {
	const res = await Http.put<ListResponse<SolicitudResponse>>(`/solicitud/${id}/cancelar?ciudadanoCancelaId=${canceladorId}`, '')
	return map(
		res,
		p => p.data,
		err => err.message,
	)
}

export const SolicitudService = {
	getAll,
    cancelarSolicitud,
}
