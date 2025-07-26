import prisma from "@/lib/prisma"

export async function createEPortfolio(title: string, link: string, ownerId: string) {
    const eportfolio = await prisma.ePortfolio.create({
        data: {
            title,
            ownerId,
            link
        }
    })

    return eportfolio;
}

export async function getSingleEPortfolioWithId(epId: string) {
    const eportfolio = await prisma.ePortfolio.findUnique({
        where: {
            id: epId
        },
        select: {
            id: true,
            title: true,
            link: true,
            ownerId:true,
            createdAt: true,
            updatedAt: true,
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

    return eportfolio;
}

export async function checkIsEPortfolioLikedByUser(epId: string, userId: string) {
    if (!epId || !userId) return false;

    const liked = await prisma.like.findUnique({
        where: {
            ownerId_ePortfolioId: {
                ePortfolioId: epId,
                ownerId: userId
            }
        }
    })
    if (liked) return true;
    else return false;
}

export async function getAllEPortfolios(userId?:string) {
    const eportfolios = await prisma.ePortfolio.findMany({
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
                    name: true,
                    image:true
                }
            }
        }
    })

    return eportfolios;
}

//used nested AND ,OR as well as conditional queries
export async function getAllEportfoliosWithFilter(searchTerm: string, year?: number) {

    const eportfolios = await prisma.ePortfolio.findMany({
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

    return eportfolios;
}

//pushed queries into query array 
export async function getAllEportfoliosWithFilter2(searchTerm: string, year?: number) {

    let queries= []

    if (searchTerm) {
        queries.push({
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
        })
    }

    if(year){
        queries.push({
            createdAt:{
                gte:new Date(year,0,1),
                lt:new Date(year+1,0,1)
            }
        })
    }

    const eportfolios = await prisma.ePortfolio.findMany({
        include: {
            owner: true,
            mentor: true
        },
        where: {
            AND: queries
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

    return eportfolios;
}

export async function getTop3MostLikedEPortfolios() {
    const eportfolios = await prisma.ePortfolio.findMany({
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

   
    return eportfolios;

}

export async function getAllEPortfoliosOfUser(userId: string) {
    const eportfolios = await prisma.ePortfolio.findMany({
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

    return eportfolios;
}

export async function addLikedByUserToEPortfolios(eportfolios: any, userId?: string) {
    if(!userId){
        const eportfoliosNew=eportfolios.map((eportfolio:any)=>({...eportfolio,likedByUser:false}))
        return eportfoliosNew;
    }

    const allLikedEportfoliosOfUser=await prisma.like.findMany({
        where:{
            type:'EPortfolio',
            ownerId:userId
        },
        select:{
            id:true
        }
    })

    const likedEPortfoliosId=allLikedEportfoliosOfUser.map((eportfolio)=>eportfolio.id)

    const likedSet= new Set(likedEPortfoliosId)

    const eportfoliosNew=eportfolios.map((eportfolio:any)=>({
        ...eportfolio,
        likedByUser:likedSet.has(eportfolio.id)
    }))

    return eportfoliosNew;

    //Old approach which is not efficient
    /*for (let i = 0; i < eportfolios.length; i++) {
        (eportfolios[i] as any).likedByUser = await checkIsEPortfolioLikedByUser((eportfolios[i] as any).id, userId)
    }*/
}

export async function updateDetailsOfEPortfolio(epId:string,obj:{
    title?:string,
    link?:string
}){
    const {title,link}=obj;

    if(!title && !link){
        return null;
    }

    const updatedEPortfolio=await prisma.ePortfolio.update({
            where:{
                id:epId
            },
            data:{
                ...(title && {title}),
                ...(link && {link}),
                updatedAt:new Date
            },
            select:{
                title:true,
                link:true,
                ownerId:true,
                mentorId:true,
                owner:{
                    select:{
                        name:true,
                        username:true
                    }
                },
                mentor:{
                    select:{
                        name:true,
                        username:true
                    }
                }
            }
    })

    return updatedEPortfolio;
}