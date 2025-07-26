import { getAllEPortfoliosOfUserController } from "@/controllers/ePortfolio.controller";
import { NextRequest } from "next/server";

/**Get all E-Portfolios of a user
 * 1.check if user is logged in or not
 * 2.fetch all eportfolios of him
 */
export async function GET(req:NextRequest,{params}:{params:Promise<{userId:string}>}){
    return getAllEPortfoliosOfUserController(req,{params})
}