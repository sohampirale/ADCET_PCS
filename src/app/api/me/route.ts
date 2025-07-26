import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
import ApiResponse from "@/lib/ApiResponse";

export async function GET(req:NextRequest){
    console.log('inside /api/me GET');
    
    try {
        const session = await getServerSession(authOptions);
        if(!session){
            return NextResponse.json(
                new ApiResponse(false,"User not logged in","NOT_LOGGED_IN",null,null),{
                    status:401
                }
            )
        }

        return NextResponse.json(
            new ApiResponse(true,"User is logged in","DONE",null,null),{
                status:200
            }
        )
    } catch (error) {
        return NextResponse.json(
            new ApiResponse(false,"Server Error","SERVER_ERROR",null,null),{
                status:500
            }
        )
    }
}