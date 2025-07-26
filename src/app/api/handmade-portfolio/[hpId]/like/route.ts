/**Like a handmade-portfolio
 * 
 */

import { likeSingleHandmadePortfolioController, unlikeSingleHandmadePortfolioController } from "@/controllers/handmadePortfolio.controller";
import { NextRequest } from "next/server";

export async function POST(req:NextRequest,{params}:{params:Promise<{hpId:string}>}){
    return likeSingleHandmadePortfolioController(req,{params})
}

export async function DELETE(req:NextRequest,{params}:{params:Promise<{hpId:string}>}){
    return unlikeSingleHandmadePortfolioController(req,{params});
}