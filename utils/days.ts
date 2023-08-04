import { DiaResponse } from '../services/responses'

const map = {
	'0': 'Lunes',
	'1': 'Martes',
	'2': 'Miércoles',
	'3': 'Jueves',
	'4': 'Viernes',
	'5': 'Sábado',
	'6': 'Domingo',
}

export const mapDays = (d: DiaResponse) => {
	return map[d]
}

export const formatFecha = (fecha, modalAgregar) => {
	try {
		if (fecha != null) {
			const dia = fecha.substring(8, 10)
			const mes = fecha.substring(5, 7)
			const anio = fecha.substring(0, 4)
			const mensaje = modalAgregar
				? `Creada el ${dia}/${mes}/${anio}`
				: `Deben retirarse antes del ${dia}/${mes}/${anio}`
			return mensaje
		}
		return 'No tiene fecha limite de retiro'
	} catch (error) {
		console.error('Error al formatear la fecha:', error)
		return 'No tiene fecha limite de retiro'
	}
}
