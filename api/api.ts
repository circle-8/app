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
		const resJSON = await fetch('http://circle8.germanmerkel.com.ar' + url, {
			method,
			body: JSON.stringify(body),
		})
		return mapResponse(await resJSON.json())
	} catch (err) {
		console.error('Error inesperado en la conexion', err, method, url, body)
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
