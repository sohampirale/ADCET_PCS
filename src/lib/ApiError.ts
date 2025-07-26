interface IApiError extends Error {
    status: number;
    code?: string;
    error?: unknown;
}


class ApiError extends Error implements IApiError {
    status: number;
    code?: string;
    error?: unknown;

    constructor(status: number, message: string, code: string, error?: unknown) {
        super(message)

        this.name="ApiError"
        this.status = status;

        if (code)
            this.code = code;

        if (error) {
            this.error = error
        }

        Error.captureStackTrace(this, this.constructor)
    }

}

export default ApiError;