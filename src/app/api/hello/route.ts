import ApiResponse from "@/lib/ApiResponse";
import { NextResponse } from "next/server";

export async function GET(req:Request){
    return NextResponse.json(
        new ApiResponse(true,"Hello World","DONE",null,null),{
            status:200
        }
    )
}