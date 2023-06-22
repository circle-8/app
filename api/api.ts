import { ErrorResponse } from '../services/responses'
import { Either, left, right } from '../utils/either'

const get = <T>(url: string) => doFetch<T>(url, 'GET')
const post = <T>(url: string, body: any) => doFetch<T>(url, 'POST', body)
const put = <T>(url: string, body: any) => doFetch<T>(url, 'PUT', body)
const del = <T>(url: string) => doFetch<T>(url, 'DELETE')

const doFetch = async <T>(
	url: string,
	method: string,
	body?: any
): Promise<Either<T, ErrorResponse>> => {
	try {
		const resJSON = await fetch('http://circle8.germanmerkel.com.ar' + url, {
			method,
			body: JSON.stringify(body),
		})
		return mapResponse(await resJSON.json())
	} catch (err) {
		console.error('Error inesperado en la conexion', err)
		return right({
			code: 'INTERNAL_ERROR',
			message: 'Error inesperado en la conexion. Intente mas tarde.',
			devMessage: 'Error inesperado en la conexion: ' + err,
		})
	}
}

const mapResponse = <T>(res: any): Either<T, ErrorResponse> => {
	if (res.code !== undefined) return right(res as ErrorResponse)
	else return left(res as T)
}

export const Http = {
	get,
	post,
	put,
	delete: del,
}
