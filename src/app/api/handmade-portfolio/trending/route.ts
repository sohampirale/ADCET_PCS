/**Get top 3 most liked portfolios
 * 1.fetch all handmade portfolios in descendiong order of their likes
 * 2.
 */

import {  getTop3MostLikedHnadmadePortfoliosController } from "@/controllers/handmadePortfolio.controller";
import { NextRequest } from "next/server";

export async function GET(req:NextRequest){
    return getTop3MostLikedHandmadePortfoliosController(req)
}
