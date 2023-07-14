import { Either, ifRight } from '../utils/either'
import { ErrorResponse } from './responses'
import { Http } from '../api/api'
import { UserService } from './user.service'

const get = <T>(url: string) => doFetch<T>(url, Http.get)
const post = <T>(url: string, body: unknown) => doFetch<T>(url, Http.post, body)
const put = <T>(url: string, body: unknown) => doFetch<T>(url, Http.put, body)
const del = <T>(url: string) => doFetch<T>(url, Http.delete)

const doFetch = async <T>(
	url: string,
	method: (url: string, body?: unknown) => Promise<Either<T, ErrorResponse>>,
	body?: unknown,
): Promise<Either<T, ErrorResponse>> => {
	// Request
	const firstRes = await method(url, body)

	let requestAgain = false
	ifRight(firstRes, async err => {
		if (err.code !== 'TOKEN_EXPIRED') {
			return
		}

		// Refresh
		const refresh = await UserService.refreshToken()
		if (!refresh) {
			requestAgain = true
		} else {
			console.error('An error has ocurred refreshing', refresh)
		}
	})

	return requestAgain ? method(url, body) : firstRes
}

export const HttpService = {
	get,
	post,
	put,
	delete: del,
}
