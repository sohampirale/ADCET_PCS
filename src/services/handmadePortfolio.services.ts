import prisma from "@/lib/prisma";

export async function createNewHandmadePortfolio(title:string,images:string[],ownerId:string,mentorId?:string){
    const handmadePortfolio=await prisma.handmadePortfolio.create({
        data:{
            title,
            images,
            ownerId,
            mentorId : mentorId ?? undefined
        }
    })
    
    return handmadePortfolio
}

//used nested AND ,OR as well as conditional queries
export async function getAllHandmadePortfoliosWithFilter(searchTerm: string, year?: number) {

    const handmadePortfolios = await prisma.handmadePortfolio.findMany({
        include: {
            owner: true,
            mentor: true
        },
        where: {
            AND: [
                ...(searchTerm ? [{
                    OR: [
                        {
                            title: {
                                contains: searchTerm,
                                mode: 'insensitive'
                            }
                        }, {
                            owner: {
                                OR: [
                                    {
                                        username: {
                                            contains: searchTerm,
                                            mode: 'insensitive'
                                        }
                                    }, {
                                        name: {
                                            contains: searchTerm,
                                            mode: 'insensitive'
                                        }
                                    }
                                ]
                            }
                        }, {
                            mentor: {
                                OR: [
                                    {
                                        username: {
                                            contains: searchTerm,
                                            mode: 'insensitive'
                                        }
                                    }, {
                                        name: {
                                            contains: searchTerm,
                                            mode: 'insensitive'
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }] : []),
                ...(year ? [{
                    createdAt: {
                        gte: new Date(year, 0, 1),
                        lt: new Date(year + 1, 0, 1)
                    }
                }
                ] : [])
            ]
        },
        select:{
            id: true,
            title: true,
            createdAt: true,
            updatedAt: true,
            _count: {
                select: {
                    likes: true
                }
            },
            owner: {
                select: {
                    name: true,
                    image: true
                }
            },
            mentor: {
                select: {
                    name: true
                }
            }
        }
    })

    return handmadePortfolios;
}

export async function getAllHandmadePortfolios() {
    const handmadePortfolios = await prisma.handmadePortfolio.findMany({
        select: {
            id: true,
            title: true,
            createdAt: true,
            updatedAt: true,
            _count: {
                select: {
                    likes: true
                }
            },
            owner: {
                select: {
                    name: true,
                    image: true
                }
            },
            mentor: {
                select: {
                    name: true
                }
            }
        }
    })
    return handmadePortfolios;
}

export async function addLikedByUserToHandmadePortfolios(handmadePortfolios: any, userId: string) {
    if(!userId){
        const handmadePortfoliosNew = handmadePortfolios.map((handmadePortfolio:any)=>({...handmadePortfolio,likedByUser:false}))
        return handmadePortfoliosNew;
    }
    
    const allLikedHandmadePortfoliosOfUser=await prisma.like.findMany({
        where:{
            ownerId:userId,
            type:'HandmadePortfolio'
        },
        select:{
            id:true
        }
    })

    const likedHandmadePortfoliosId=allLikedHandmadePortfoliosOfUser.map((handmadePortfolio)=>handmadePortfolio.id)

    const likedSet= new Set(likedHandmadePortfoliosId)

    const handmadePortfolioNew=handmadePortfolios.map((handmadePortfolio:any)=>({
        ...handmadePortfolio,
        likedByUser:likedSet.has(handmadePortfolio.id)
    }))

    return handmadePortfolioNew;

    //Old inefficient logic
    /*
    for (let i = 0; i < handmadePortfolios.length; i++) {
        (handmadePortfolios[i] as any).likedByUser = await checkIsHandmadePortfolioLikedByUser((handmadePortfolios[i] as any).id, userId)
    }
        */
}

export async function checkIsHandmadePortfolioLikedByUser(hpId: string, userId: string) {
    if (!hpId || !userId) return false;

    const liked = await prisma.like.findUnique({
        where: {
            ownerId_handmadePortfolioId: {
                handmadePortfolioId: hpId,
                ownerId: userId
            }
        }
    })
    
    if (liked) return true;
    else return false;
}

export async function getSingleHandmadePortfolioWithId(hpId: string) {
    const handmadePortfolio = await prisma.handmadePortfolio.findUnique({
        where: {
            id: hpId
        },
        select: {
            id: true,
            title: true,
            images: true,
            createdAt: true,
            updatedAt: true,
            ownerId:true,
            owner: {
                select: {
                    id: true,
                    name: true
                }
            },
            mentor: {
                select: {
                    id: true,
                    name: true
                }
            },
            _count: {
                select: {
                    likes: true
                }
            }
        }
    })

    return handmadePortfolio;
}

export async function getTop3MostLikedHandmadePortfolios() {
    const handmadePortfolios = await prisma.handmadePortfolio.findMany({
        take:3,
        select: {
            id: true,
            title: true,
            createdAt: true,
            updatedAt: true,
            _count: {
                select: {
                    likes: true
                }
            },
            owner: {
                select: {
                    name: true,
                    image: true
                }
            },
            mentor: {
                select: {
                    name: true
                }
            }
        },
        orderBy: {
            _count: {
                likes: "desc"
            }
        }
    })

    return handmadePortfolios;
}

export async function getAllHandmadePortfoliosOfUser(userId: string) {
    const handmadePortfolios = await prisma.handmadePortfolio.findMany({
        where: {
            ownerId: userId
        },
        select: {
            id: true,
            title: true,
            createdAt:true,
            _count:{
                select:{
                    likes:true
                }
            }
        },
        orderBy:{
            _count:{
                likes:"desc"
            }
        }
    })

    return handmadePortfolios;
}