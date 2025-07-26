import { RESPONSE_CODES } from "@/constants";
import ApiError from "@/lib/ApiError";
import ApiResponse from "@/lib/ApiResponse";
import checkUserLoggedInOrThrow from "@/lib/checkUserLoggedInOrThrow";
import handleError from "@/lib/handleError";
import { editMetadataOfEventSchema } from "@/schemas";
import { editEventMetadata, getSingleEventWithEventId } from "@/services/event.services";
import { NextRequest, NextResponse } from "next/server";

//Updating title/thumbnail/description of the event

export async function PUT(req:NextRequest,{params}:{params:Promise<{evId:string}>}){
     try {
        const { evId: receivedEvId } = await params;
        const { title:receivedTitle,thumbnail:receivedThumbnail,description:receivedDescription } = await req.json();

        const obj = {
            evId:receivedEvId,
            title:receivedTitle,
            thumbnail:receivedThumbnail,
            description:receivedDescription
        }

        const parsed = editMetadataOfEventSchema.safeParse(obj)

        if (!parsed.success) {
            throw new ApiError(400, "Invalid event id or data format priovided", RESPONSE_CODES.INVALID, parsed.error.flatten())
        }

        const { evId, title,description,thumbnail } = parsed.data;

        const user = await checkUserLoggedInOrThrow();

        if (user.role !== 'MENTOR') {
            throw new ApiError(401, "Only mentor of this event can perform this action", RESPONSE_CODES.UNAUTHORIZED)
        }

        const event = await getSingleEventWithEventId(evId);

        if (!event) {
            throw new ApiError(404, "Event not found", RESPONSE_CODES.NOT_FOUND, null)
        } else if (event.mentorId !== user.id) {
            throw new ApiError(401, "Only mentor of this event can perform this action", RESPONSE_CODES.UNAUTHORIZED, null)
        }

        const updatedEvent = await editEventMetadata(evId, {title,description,thumbnail})

        return NextResponse.json(
            new ApiResponse(true, "Event updated successfully", RESPONSE_CODES.DONE, updatedEvent, null), {
                status: 200
            }
        )

    } catch (error) {
        return handleError(error)
    }
}