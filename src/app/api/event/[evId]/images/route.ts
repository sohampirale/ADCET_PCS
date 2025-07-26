import { updateImagesOfEventController } from "@/controllers/event.controller";
import { NextRequest } from "next/server";

/**Adding images to an event
 * 1.retrive evId from params, images from body
 * 2.validate evId and images
 * 3.check if user logged in and is a mentor
 * 4.check if event exists and user.id === event.mentorId
 * 5.update the images 
 * 6.return response
 */

export async function PUT(req: NextRequest, { params }: { params: Promise<{ evId: string }> }) {
    return updateImagesOfEventController(req,{params})
}