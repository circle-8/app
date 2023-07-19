import { Http } from '../api/api'
import { ifLeft } from '../utils/either'
import {
	ListResponse,
	PuntoReciclajeResponse,
	PuntoResiduoResponse,
	PuntoResponse,
	PuntoVerdeResponse,
} from './responses'
import { Punto, TipoPunto } from './types'

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
	tipos: TipoPunto[],
	tipo?: TipoPunto,
	residuos?: string[],
	dias?: string[],
	recicladorId?: number,
	ciudadanoId?: number
}

const getAll = async (f: Filter): Promise<Punto[]> => {
	const points: Punto[] = []

	for (const t of f.tipos)
		points.push(...(await getPuntos({...f, tipo: t})))

	return points
}

const getPuntos = async ({ tipo, residuos, dias, recicladorId }: Filter): Promise<Punto[]> => {
	let url = mapPoint[tipo].url
	for (const residuo of residuos || [])
		url += 'tipos_residuo=' + residuo + '&'
	for (const dia of dias || [])
		url += 'dias=' + dia + '&'
	if (recicladorId)
		url += 'reciclador_id=' + recicladorId

	const response = await Http.get<ListResponse<PuntoResponse>>(url)

	const points = []
	ifLeft(response, l =>
		points.push(
			...l.data.map(t => {
				let titulo: string
				if (tipo === 'RESIDUO') {
					const res = t as PuntoResiduoResponse
					titulo = `Retirá los residuos de ${res.ciudadano?.username || ''}`
				} else if (tipo == 'VERDE') {
					titulo = (t as PuntoVerdeResponse).titulo || 'Punto Verde'
				} else {
					titulo = (t as PuntoReciclajeResponse).titulo
				}

				return { ...t, tipo, titulo }
			}),
		),
	)

	return points
}

export const PuntoServicio = {
	getAll,
}
