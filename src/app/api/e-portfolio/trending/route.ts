import { getTop3MostLikedEPortfoliosController } from "@/controllers/ePortfolio.controller";
import { NextRequest } from "next/server";
//
/**Get top 3 most liked E-Portfolios
 * 1.fetch all th ee portfolios by descending order of their no of likes 
 * 2.return top 3 only
 */

export async function GET(req:NextRequest){
    return getTop3MostLikedHandmadePortfoliosController(req)
}