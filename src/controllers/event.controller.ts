import { RESPONSE_CODES } from "@/constants";
import ApiError from "@/lib/ApiError";
import ApiResponse from "@/lib/ApiResponse";
import checkUserLoggedInOrThrow from "@/lib/checkUserLoggedInOrThrow";
import handleError from "@/lib/handleError";
import { createEventSchema, editEventCoordinatorsSchema, editImagesOfEventSchema, prismaIdSchema } from "@/schemas";
import { createEvent, createEventCoordinator, deleteSingleEventCoordinator, editEventImages, getSingleEventWithEventId } from "@/services/event.services";
import { createLikeForEvent, deleteOneLikeOfEvent, getLikeOfEvent } from "@/services/like.services";
import { NextRequest, NextResponse } from "next/server";

export async function createEventController(req: NextRequest) {
    try {
        //mentorId is not taken from body but extarcted from user.id
        const body: { title: string, descrition: string, mentorId?: string, images?: string[],videos?:string[], credits?: any, thumbnail?: string, createdAt?: Date } = await req.json();

        const user = await checkUserLoggedInOrThrow();

        if (user.role !== "Mentor") {
            throw new ApiError(401, "Only a mentor can create the event", RESPONSE_CODES.UNAUTHORIZED, null)
        }

        body.mentorId = user.id
        // body.ownerId=body.ownerId;

        const parsed = createEventSchema.safeParse(body);

        if (!parsed.success) {
            throw new ApiError(400, "Invalid data format provided", RESPONSE_CODES.INVALID,parsed.error);
        }

        // const {credits,title,images,videos,ownerId,createdAt,thumbnail}=parsed.data;
        const data = parsed.data;

        const event = await createEvent(data)

        const credits = parsed.data.credits;

        if (!credits) {
            return NextResponse.json(
                new ApiResponse(true, "Event created successfully,you can also add credits", RESPONSE_CODES.DONE, event, null), {
                    status: 200
                }
            )
        }

        const minorErrors: string[] = []

        for (const credit in credits) {
            const coordinatorIds = credits[credit]

            for (let i = 0; i < coordinatorIds.length; i++) {

                try {
                    const eventCoordinator = await createEventCoordinator(event.id, coordinatorIds[i].id, credit);
                } catch (error) {
                    const str = `Failed to add ${coordinatorIds[i].username} to the event as : ${credit}`;
                    minorErrors.push(str);
                }
            }

        }

        const eventWithCoordinators = await getSingleEventWithEventId(event.id);

        return NextResponse.json(
            new ApiResponse(true, "Event created successfully", RESPONSE_CODES.DONE, eventWithCoordinators, minorErrors), {
                status: 201
            }
        )

    } catch (error) {
        return handleError(error);
    }
}

export async function addEventCoordinatorsController(req: NextRequest, { params }: { params: Promise<{ evId: string }> }) {
    try {

        const { evId: receivedEvId } = await params;

        const user = await checkUserLoggedInOrThrow();

        if (user.role !== "Mentor") {
            throw new ApiError(401, 'This permission is only allowed for mentor of the event', RESPONSE_CODES.UNAUTHORIZED, null)
        }

        const { credits: receivedCredits } = await req.json();

        const parsed = editEventCoordinatorsSchema.safeParse({ credits: receivedCredits, evId: receivedEvId })

        if (!parsed.success) {
            throw new ApiError(400, "Invalid event id or credits format provided", RESPONSE_CODES.INVALID, null);
        }

        const { evId, credits } = parsed.data;

        const event = await getSingleEventWithEventId(evId);

        if (!event) {
            throw new ApiError(404, "Event not found", RESPONSE_CODES.NOT_FOUND, null)
        } else if (event.mentorId !== user.id) {
            throw new ApiError(401, "Event details can only be changed by the mentor of that particular event", RESPONSE_CODES.UNAUTHORIZED, null);
        }

        const minorErrors: string[] = []

        for (const credit in credits) {
            const coordinatorIds: { id: string, username: string }[] = credits[credit];

            for (let i = 0; i < coordinatorIds.length; i++) {
                try {
                    const eventCoordinator = await createEventCoordinator(evId, coordinatorIds[i].id, credit)
                } catch (error) {
                    const str = `Failed to assign credit:${credit} to ${coordinatorIds[i].username}`
                    minorErrors.push(str);
                }
            }
        }

        const eventWithAddedCoordinators = await getSingleEventWithEventId(evId);

        return NextResponse.json(
            new ApiResponse(true, "Credits asssigned successfully", RESPONSE_CODES.DONE, eventWithAddedCoordinators), {
            status: 200
        }
        )

    } catch (error) {
        return handleError(error)
    }
}

export async function removeEventCoordinatorsController(req: NextRequest, { params }: { params: Promise<{ evId: string }> }) {
    try {
        const { evId: receievedEvId } = await params;

        const { credits: receivedCredits } = await req.json();

        const parsed = editEventCoordinatorsSchema.safeParse({ evId: receievedEvId, credits: receivedCredits });

        if (!parsed.success) {
            throw new ApiError(400, "Invalid event Id or credits format provided", RESPONSE_CODES.INVALID);
        }

        const { evId, credits } = parsed.data;

        const user = await checkUserLoggedInOrThrow();

        if (user.role !== "Mentor") {
            throw new ApiError(401, "This permission is only allowed for mentor of this event", RESPONSE_CODES.UNAUTHORIZED)
        }

        const event = await getSingleEventWithEventId(evId);

        if (!event) {
            throw new ApiError(404, "Event not found", RESPONSE_CODES.NOT_FOUND)
        } else if (event.mentorId !== user.id) {
            throw new ApiError(401, "Event can only be updated by mentor of this event", RESPONSE_CODES.UNAUTHORIZED)
        }

        const minorErrors: string[] = []

        for (const credit in credits) {
            const coordinatorIds = credits[credit]
            for (let i = 0; i < coordinatorIds.length; i++) {
                if (!await deleteSingleEventCoordinator(evId, coordinatorIds[i].id, credit)) {
                    const str = `Failed to remove credit:${credit} from ${coordinatorIds[i].username}`
                    minorErrors.push(str)
                }
            }
        }

        const eventWithUpdatedCoordinators = await getSingleEventWithEventId(evId)

        return NextResponse.json(
            new ApiResponse(true, "Credits of requested coordinators successfully removed from this event", RESPONSE_CODES.DONE, eventWithUpdatedCoordinators, minorErrors), {
            status: 200
        }
        )

    } catch (error) {
        return handleError(error)
    }
}

export async function updateImagesOfEventController(req: NextRequest, { params }: { params: Promise<{ evId: string }> }) {
    try {
        const { evId: receivedEvId } = await params;
        const { images: receivedImages } = await req.json();

        const parsed = editImagesOfEventSchema.safeParse({ evId: receivedEvId, images: receivedImages })

        if (!parsed.success) {
            throw new ApiError(400, "Invalid event id or images format priovided", RESPONSE_CODES.INVALID, parsed.error.flatten())
        }

        const { evId, images } = parsed.data;

        const user = await checkUserLoggedInOrThrow();

        if (user.role !== 'Mentor') {
            throw new ApiError(401, "Only mentor of this event can perform this action", RESPONSE_CODES.UNAUTHORIZED)
        }

        const event = await getSingleEventWithEventId(evId);

        if (!event) {
            throw new ApiError(404, "Event not found", RESPONSE_CODES.NOT_FOUND, null)
        } else if (event.mentorId !== user.id) {
            throw new ApiError(401, "Only mentor of this event can perform this action", RESPONSE_CODES.UNAUTHORIZED, null)
        }

        const updatedEvent = await editEventImages(evId, images)

        return NextResponse.json(
            new ApiResponse(true, "Images updated successfully", RESPONSE_CODES.DONE, updatedEvent, null), {
            status: 200
        }
        )

    } catch (error) {
        return handleError(error)
    }
}


export async function likeSingleEventController(req: NextRequest, context: { params: Promise<{ evId: string }> }) {
    try {

        const { evId: receivedEvId } = await context.params;

        const parsed = prismaIdSchema.safeParse(receivedEvId);

        if (!parsed.success) {
            throw new ApiError(400, "Invalid Event id provided", RESPONSE_CODES.INVALID, null)
        }

        const evId = parsed.data;

        const {id:userId} = await checkUserLoggedInOrThrow();

        const eventExists = await getSingleEventWithEventId(evId);

        if (!eventExists) {
            throw new ApiError(404, "Requested Event does not exists", RESPONSE_CODES.NOT_FOUND, null)
        }

        const likeExists = await getLikeOfEvent(evId,userId!)

        if (likeExists) {
            return NextResponse.json(
                new ApiResponse(false, "This event is already liked by you", RESPONSE_CODES.INVALID, null, null), {
                    status: 409
                }
            )
        }

        await createLikeForEvent(evId,userId!);

        return NextResponse.json(
            new ApiResponse(true, "Event liked successfully", RESPONSE_CODES.DONE, null, null), {
                status: 201
            }
        )

    } catch (error) {
        return handleError(error)
    }
}

export async function unlikeSingleEventController(req:NextRequest,context:{params:Promise<{evId:string}>}){
    try {
      const {evId:receivedEvId} = await context.params;

      const parsed= prismaIdSchema.safeParse(receivedEvId);

      if(!parsed.success){
         throw new ApiError(400,"Invalid event id provided",RESPONSE_CODES.INVALID,null);
      }
      
      const evId = parsed.data;

      const {id:userId} = await checkUserLoggedInOrThrow();

      const evExists=await getSingleEventWithEventId(evId);

      if(!evExists){
         throw new ApiError(404,"Event does not exists anymore",RESPONSE_CODES.NOT_FOUND,null)
      }

      const likeExists = await getLikeOfEvent(evId,userId!);

      if(!likeExists){
         throw new ApiError(409,"This event is not liked by you",RESPONSE_CODES.INVALID,null)
      }

      const deletedLike = await deleteOneLikeOfEvent(evId,userId!)

      return NextResponse.json(
         new ApiResponse(true,"Event unliked successfully",RESPONSE_CODES.DONE,null,null),{
            status:200
         }
      )

   } catch (error) {
      return handleError(error)
   }
}