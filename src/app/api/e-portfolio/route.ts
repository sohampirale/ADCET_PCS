import { createPortfolio, getAllEPortfoliosController } from "@/controllers/ePortfolio.controller";
import ApiResponse from "@/lib/ApiResponse";
import prisma from "@/lib/prisma";
import { createPortfolioSchema } from "@/schemas";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

/** Create E-Portfolio
 * 1.validation on the req.body
 * 1.check if user logged in
 * 2.create the e-portfolio
 * 3.return response
 */

export async function POST(req:NextRequest){
    return createPortfolio(req);
}

//t

/**Get all E-Portfolois
 * 1.fetch all portfolio from DB
 * 2.return
 */

export async function GET(req:NextRequest){
    return getAllEPortfoliosController(req);
}