import { RESPONSE_CODES } from "@/constants";
import { addEventCoordinatorsController, removeEventCoordinatorsController } from "@/controllers/event.controller";
import ApiError from "@/lib/ApiError";
import ApiResponse from "@/lib/ApiResponse";
import checkUserLoggedInOrThrow from "@/lib/checkUserLoggedInOrThrow";
import handleError from "@/lib/handleError";
import { creditsSchema, editEventCoordinatorsSchema } from "@/schemas";
import { createEventCoordinator, deleteSingleEventCoordinator, getSingleEventWithEventId } from "@/services/event.services";
import { NextRequest, NextResponse } from "next/server";
import { use } from "react";

/**Adding coordinators to an event
 *  evId,mentorId,credits
 * 1.retrive evId from params, mentorId from user.id, credits from body
 * 2.check if user is logged in and user is a mentor
 * 3.validate credits and evId
 * 4.fetch event and check is event.mentorId===user.id
 * 5.create eventCoordinator one by one for each key 
 * 6.return response
 */

export async function PUT(req:NextRequest,{params}:{params:Promise<{evId:string}>}){
    return addEventCoordinatorsController(req,{params})
}

/** Removing coordinators from an event
 * 1.retrive evId from params,credits from body
 * 2.validation on the credits and evId
 * 3.check if user logged in and is mentor
 * 4.fetch event and check event.mentorId===user.id
 * 5.iterate for every credit of credits and check if that EventCoordinator row exists if yes then delete it
 * 6.return the updated event
 */

export async function DELETE(req:NextRequest,{params}:{params:Promise<{evId:string}>}){
   return removeEventCoordinatorsController(req,{params})
}