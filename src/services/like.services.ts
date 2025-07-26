import prisma from "@/lib/prisma";

export async function getLikeOfEportfolio(ePortfolioId:string,userId:string){
    const like = await prisma.like.findUnique({
        where:{
            ownerId_ePortfolioId:{
                ownerId:userId,
                ePortfolioId
            }
        }
    })

    return like;
}

export async function createLikeForEPortfolio(epId:string,userId:string){
    const like = await prisma.like.create({
        data:{
            ownerId:userId,
            ePortfolioId:epId,
            type:"EPortfolio"
        }
    })

    return like;
}

export async function deleteOneLikeOfEPortfolio(epId:string,userId:string){
    const deletedLike = await prisma.like.delete({
        where:{
            ownerId_ePortfolioId:{
                ownerId:userId,
                ePortfolioId:epId
            }
        }
    })
    
    return deletedLike;
}

export async function getLikeOfHandmadePortfolio(handmadePortfolioId:string,userId:string){
    const like = await prisma.like.findUnique({
        where:{
            ownerId_handmadePortfolioId:{
                ownerId:userId,
                handmadePortfolioId
            }
        }
    })

    return like;
}

export async function createLikeForHandmadePortfolio(handmadePortfolioId:string,userId:string){
    const like = await prisma.like.create({
        data:{
            ownerId:userId,
            handmadePortfolioId,
            type:"HandmadePortfolio"
        }
    })

    return like;
}

export async function deleteOneLikeOfHandmadePortfolio(handmadePortfolioId:string,userId:string){
    const deletedLike = await prisma.like.delete({
        where:{
            ownerId_handmadePortfolioId:{
                ownerId:userId,
                handmadePortfolioId
            }
        }
    })
    
    return deletedLike;
}

export async function getLikeOfEvent(evId:string,userId:string){
    const like = await prisma.like.findUnique({
        where:{
            ownerId_eventId:{
                ownerId:userId,
                eventId:evId
            }
        }
    })

    return like;
}



export async function createLikeForEvent(evId:string,userId:string){
    const like = await prisma.like.create({
        data:{
            ownerId:userId,
            eventId:evId,
            type:"Event"
        }
    })

    return like;
}

export async function deleteOneLikeOfEvent(evId:string,userId:string){
    const deletedLike = await prisma.like.delete({
        where:{
            ownerId_eventId:{
                ownerId:userId,
                eventId:evId
            }
        }
    })
    
    return deletedLike;
}