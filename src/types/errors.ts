/**
 * Thrown when the operation is cancelled via AbortController.
 */
export class AbortError extends Error {
	constructor(message: string = "Request was cancelled by the user") {
		super(message);
		this.name = "AbortError";
		// Necessary for correct prototype chain when extending Error in TypeScript
		Object.setPrototypeOf(this, AbortError.prototype);
	}
}

/**
 * Thrown when the system fails to generate a unique short ID after multiple attempts.
 */
export class UrlCollisionError extends Error {
	constructor(
		message: string = "Failed to generate a unique short URL after multiple retries",
	) {
		super(message);
		this.name = "UrlCollisionError";
		Object.setPrototypeOf(this, UrlCollisionError.prototype);
	}
}
