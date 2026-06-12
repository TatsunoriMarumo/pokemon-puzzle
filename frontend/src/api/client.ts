import { ERROR_CODES } from "../constants/errorCodes";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
    throw new Error(ERROR_CODES.API_BASE_URL_MISSING);
}

export const apiClient = {
    async get<T>(path: string): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${path}`);

        if (!response.ok) {
            throw new Error(ERROR_CODES.API_REQUEST_FAILED);
        }

        return response.json() as Promise<T>;
    },
};
