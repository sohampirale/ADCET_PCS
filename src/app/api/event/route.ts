import { createEventController } from "@/controllers/event.controller";
import { NextRequest } from "next/server";

/** Create an event - ~title,~images,~ownerId,~date(optional),~credits:{title:[usernames]},thumbnail(optional)
 * 1.retrive data from body
 * 2.check user logged in
 * 3.validate all things
 * 4.retrive id:ownerId from user
 * 5.create the event
 * 6.start to create EventCoordinator one by one in the credits and store somewhere temp
 * 7.update the event for created EventCoordinator array
 * 8.return the response
 */

export async function POST(req:NextRequest){
    return createEventController(req);
}

/** Updating => 
 * 1.Adding coordinators,
 * 2.changing title 
 * 3.chaning thumbnail 
 * 4.add more images 
 * 5.remove coordinators
 * 6.deleting images
 */