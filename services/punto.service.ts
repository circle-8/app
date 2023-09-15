import { Http } from '../api/api'
import { Either, ifLeft, map } from '../utils/either'
import {
	ListResponse,
	PuntoReciclajeResponse,
	PuntoResiduoResponse,
	PuntoResponse,
	PuntoVerdeResponse,
} from './responses'
import { Dia, ErrorMessage, Punto, PuntoReciclaje, PuntoResiduo, TipoPunto } from './types'

const mapPoint = {
	RESIDUO: {
		url: '/puntos_residuo?expand=ciudadano&',
	},
	RECICLAJE: {
		url: '/puntos_reciclaje?',
	},
	VERDE: {
		url: '/puntos_verdes',
	},
}

type Filter = {
	tipos: TipoPunto[]
	tipo?: TipoPunto
	residuos?: string[]
	dias?: string[]
	recicladorId?: number
	ciudadanoId?: number
}

const getAll = async (f: Filter): Promise<Punto[]> => {
	const points: Punto[] = []

	for (const t of f.tipos) points.push(...(await getPuntos({ ...f, tipo: t })))

	return points
}

const mapResponse = (p: PuntoResponse, tipo: TipoPunto): Punto => {
	let titulo: string
	if (tipo === 'RESIDUO') {
		const res = p as PuntoResiduoResponse
		titulo = `Retirá los residuos de ${res.ciudadano?.username || ''}`
	} else if (tipo == 'VERDE') {
		titulo = (p as PuntoVerdeResponse).titulo || 'Punto Verde'
	} else {
		titulo = (p as PuntoReciclajeResponse).titulo
	}

	return { ...p, tipo, titulo }
}

const getPuntos = async ({
	tipo,
	residuos,
	dias,
	recicladorId,
	ciudadanoId,
}: Filter): Promise<Punto[]> => {
	let url = mapPoint[tipo].url
	for (const residuo of residuos || []) url += 'tipos_residuo=' + residuo + '&'
	for (const dia of dias || []) url += 'dias=' + dia + '&'
	if (recicladorId) url += 'reciclador_id=' + recicladorId + '&'
	if (ciudadanoId) url += 'ciudadano_id=' + ciudadanoId

	const response = await Http.get<ListResponse<PuntoResponse>>(url)

	const points = []
	ifLeft(response, l => points.push(...l.data.map(p => mapResponse(p, tipo))))

	return points
}

const getPuntoReciclaje = async (
	id: number,
	recicladorId: number,
): Promise<Either<PuntoReciclaje, ErrorMessage>> => {
	const url = `/reciclador/${recicladorId}/punto_reciclaje/${id}`
	const res = await Http.get<PuntoReciclajeResponse>(url)
	return map(
		res,
		p => mapResponse(p, 'RECICLAJE') as PuntoReciclaje,
		err => err.message,
	)
}

type PuntoReciclajeSave = {
	id?: number
	recicladorId: number
	titulo?: string
	tiposResiduo?: number[]
	dias?: Dia[]
	latitud?: number
	longitud?: number
}

const savePuntoReciclaje = async (p: PuntoReciclajeSave) => {
	const url = `/reciclador/${p.recicladorId}/punto_reciclaje/${p.id}`
	const method = p.id ? Http.put : Http.post
	const res = await method<PuntoReciclajeResponse>(url, p)
	return map(
		res,
		p => mapResponse(p, 'RECICLAJE') as PuntoReciclaje,
		err => err.message,
	)
}

type PuntoResiduoSave = {
	id?: number
	ciudadanoId: number
	latitud: number
	longitud: number
}
const savePuntoResiduo = async (p: PuntoResiduoSave) => {
	const url = `/ciudadano/${p.ciudadanoId}/punto_residuo/${p.id}`
	const method = p.id ? Http.put : Http.post
	const res = await method<PuntoResiduoResponse>(url, p)
	return map(
		res,
		p => mapResponse(p, 'RESIDUO') as PuntoResiduoResponse,
		err => err.message,
	)
}

const getPuntoResiduo = async (
	id: number,
	ciudadanoId: number,
): Promise<Either<PuntoResiduo, ErrorMessage>> => {
	const url = `/ciudadano/${ciudadanoId}/punto_residuo/${id}?expand=ciudadano&expand=residuos`
	const res = await Http.get<PuntoResiduoResponse>(url)
	return map(
		res,
		p => mapResponse(p, 'RESIDUO') as PuntoResiduo,
		err => err.message,
	)
}

const postRetiroResiduo = async (
	id: number,
	idPuntoReciclaje: number,
): Promise<Either<PuntoResiduo, ErrorMessage>> => {
	const url = `/residuo/${id}/notificacion/${idPuntoReciclaje}`;
	const res = await Http.post<PuntoResiduoResponse>(url, {})
	return map(
		res,
		p => mapResponse(p, 'RESIDUO') as PuntoResiduo,
		err => err.message
	)
}

export const PuntoService = {
	getAll,
	getPuntoReciclaje,
	savePuntoReciclaje,
	savePuntoResiduo,
	getPuntoResiduo,
	postRetiroResiudo: postRetiroResiduo,
}
