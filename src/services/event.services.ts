import prisma from "@/lib/prisma";
import { eventNames } from "process";

export async function createEvent(data:{title:string,description:string,mentorId:string,images?:string[],videos?:string[],thumbnail?:string,createdAt?:Date}){
    let {title,description,mentorId,images,videos,thumbnail,createdAt}=data;

    if(!thumbnail && images?.length!=0){
        thumbnail=images?.[0]
    }

    const event = await prisma.event.create({
        data:{
            title,
            description,
            mentorId,
            ...(thumbnail && {thumbnail}),
            ...(images && {images}),
            ...(videos && {videos}),
            ...(createdAt && {createdAt})
        }
    })

    return event;
}

export async function createEventCoordinator(eventId:string,coordinatorId:string,credit:string){
    if(!eventId || !coordinatorId || !credit) return null;

    const eventCoordinator = prisma.eventCoordinator.create({
        data:{
            eventId,
            coordinatorId,
            credit
        }
    })

    return eventCoordinator;
}

export async function getSingleEventWithEventId(eventId:string){
    const event = await prisma.event.findUnique({
        where:{
            id:eventId
        },
        select:{
            id:true,
            title:true,
            description:true,
            mentorId:true,
            thumbnail:true,
            coordinators:true,
            images:true
        }
    })
    return event;
}

export async function getSingleEventCoordinator(evId:string,coordinatorId:string,credit:string){
    const eventCoordinator=await prisma.eventCoordinator.findUnique({
        where:{
            eventId_coordinatorId_credit:{
                eventId:evId,
                coordinatorId,
                credit
            }
        }
    })

    return eventCoordinator;
}

export async function deleteSingleEventCoordinator(evId:string,coordinatorId:string,credit:string){
    if(!evId || !coordinatorId || !credit)return null;

    try {
        const deletedEventCoordinator = await prisma.eventCoordinator.delete({
            where:{
                eventId_coordinatorId_credit:{
                    eventId:evId,
                    coordinatorId,
                    credit
                }
            }
        })
        return deletedEventCoordinator;
    } catch (error) {
        return null;
    }
}

export async function editEventImages(evId:string,images:string[]){
    const event=await prisma.event.update({
        where:{
            id:evId
        },
        data:{
            images
        },
        select:{
            id:true,
            title:true,
            description:true,
            mentorId:true,
            thumbnail:true,
            coordinators:true,
            images:true
        }
    })

    return event;
}

export async function editEventMetadata(evId:string,obj:{
    title?:string,
    description?:string,
    thumbnail?:string
}){
    const {title,description,thumbnail} = obj

     const event=await prisma.event.update({
        where:{
            id:evId
        },
        data:{
            ...(title && {title}),
            ...(description && {description}),
            ...(thumbnail && {thumbnail})
        },
        select:{
            id:true,
            title:true,
            description:true,
            mentorId:true,
            thumbnail:true,
            coordinators:true,
            images:true
        }
    })

    return event;
}