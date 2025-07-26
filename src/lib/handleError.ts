import { NextResponse } from "next/server"
import ApiError from "./ApiError"
import ApiResponse from "./ApiResponse"

export default function handleError(error:unknown) {
    console.log('error : ',error);
    if (error instanceof ApiError) {
        return NextResponse.json(
            new ApiResponse(false, error.message, error.code, null, null), {
            status: error.status
        }
        )
    }
    
    return NextResponse.json(
        new ApiResponse(false, "Errot from the backend", "SERVER_ERROR", null, null), {
        status: 500
    }
    )
}