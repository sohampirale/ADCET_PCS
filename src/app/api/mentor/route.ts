//Get all mentors suggestions

import { RESPONSE_CODES } from "@/constants";
import ApiResponse from "@/lib/ApiResponse";
import handleError from "@/lib/handleError";
import { getAllMentors } from "@/services/user.services";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest){
    try {
        const allMentors =await getAllMentors();

        return NextResponse.json(
            new ApiResponse(true,"All mentors fetched successfully",RESPONSE_CODES.DONE,allMentors,null),{
                status:200
            }
        )

    } catch (error) {
        return handleError(error)
    }
}