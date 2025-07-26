/**Get a Handmade portfolio
 * 1.retrive hpId from params
 * 2.fetch the handmadeportfolio
 * 3.add whether liked by logged in user or not
 * 4.return response
 */

import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import ApiError from "@/lib/ApiError";
import { prismaIdSchema } from "@/schemas";
import { NextRequest, NextResponse } from "next/server";
import ApiResponse from "@/lib/ApiResponse";
import handleError from "@/lib/handleError";
import { checkIsHandmadePortfolioLikedByUser, getSingleHandmadePortfolioWithId } from "@/services/handmadePortfolio.services";
import { getSingleHandmadePortfolioController } from "@/controllers/handmadePortfolio.controller";

export async function GET(req:NextRequest,{ params }:{params:Promise<{hpId:string}>}){
    return getSingleHandmadePortfolioController(req,{params})
}