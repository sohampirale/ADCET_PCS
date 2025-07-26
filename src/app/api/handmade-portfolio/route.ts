import { createHandmadePortfolio, getAllHandmadePortfoliosController } from "@/controllers/handmadePortfolio.controller";
import { getAllHandmadePortfolios, getAllHandmadePortfoliosWithFilter } from "@/services/handmadePortfolio.services";
import { NextRequest } from "next/server";

/**Create Handmade Portfolio
 * 1.retirve req.body
 * 2.validation
 * 3.check if user is logged in
 * 4.create the handmade portfolio
 */

export async function POST(req:NextRequest){
    return createHandmadePortfolio(req);
}

/**Get all Handmade-portfolios
 * 
 */

//
export async function GET(req: NextRequest) {
   return getAllHandmadePortfoliosController(req);
}
