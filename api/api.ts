import { ErrorResponse } from '../services/responses'
import { Either, left, right } from '../utils/either'

const get = <T>(url: string) => doFetch<T>(url, 'GET')
const post = <T>(url: string, body?: unknown) => doFetch<T>(url, 'POST', body)
const put = <T>(url: string, body?: unknown) => doFetch<T>(url, 'PUT', body)
const del = <T>(url: string) => doFetch<T>(url, 'DELETE')

const doFetch = async <T>(
	url: string,
	method: string,
	body?: unknown
): Promise<Either<T, ErrorResponse>> => {
	try {
		const bodyJSON = JSON.stringify(body)
		const resJSON = await fetch('http://192.168.0.13:8080' + url, {
			method,
			body: bodyJSON,
		})

		// if ( resJSON.status != 200 ) {
		// 	console.error('status not 200', method, url, await resJSON.text())
		// }

		return mapResponse(await resJSON.json())
	} catch (err) {
		console.error('Error inesperado en la conexion', err, method, url)
		return right({
			code: 'INTERNAL_ERROR',
			message: 'Error inesperado en la conexion. Intente mas tarde.',
			devMessage: 'Error inesperado en la conexion: ' + err,
		})
	}
}

type HasCode = {
	code?: unknown
}

const mapResponse = <T>(res: HasCode): Either<T, ErrorResponse> => {
	if (res === null) return left(null)
	else if (res.code !== undefined) return right(res as ErrorResponse)
	else return left(res as T)
}

export const Http = {
	get,
	post,
	put,
	delete: del,
}
