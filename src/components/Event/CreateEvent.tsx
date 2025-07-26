"use client"

import { createEventSchema, linkSchema } from "@/schemas"
import axios from "axios";
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"
import { 
    Calendar, 
    Upload, 
    Image as ImageIcon, 
    Video, 
    Users, 
    Trash2, 
    ArrowUp, 
    ArrowDown, 
    Plus, 
    X, 
    Search,
    FileText,
    Award,
    Loader2,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

interface IImageCloudinaryResponse{
    public_id:string,
    secure_url:string
}

export function CreateEvent() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status == "unauthenticated") {
            console.log('unauthenticated');
            alert()
            router.push("/signin")
        } else if (status == 'authenticated' && session.user.role !== 'Mentor') {
            console.log('Only mentors are allowed to create event');
            console.log('session.user.role :',session.user.role);
            
            alert();
            setTimeout(() => {
                // router.push('/events')
            }, 1000)
        }
    }, [status, router])

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [thumbnail, setThumbnail] = useState("")
    const [addThumbnail, setAddThumbnail] = useState(false);
    const [imageUrls, setImageUrls] = useState<string[]>([])
    const [imagesCloudinaryResponses, setImagesCloudinaryResponses] = useState<IImageCloudinaryResponse[]>([])
    const [videos, setVideos] = useState<string[]>([])
    const [credits, setCredits] = useState({})
    const [createdAt, setCreatedAt] = useState(new Date())
    const [addYtVideoLink, setAddYtVideoLink] = useState(false)
    const [ytVideoLink, setYtVideoLink] = useState("")
    const [thumbnailPublicId,setThumnailPublicId] = useState("")
    const [creditTitle,setCreditTitle] = useState("")
    const [searchTerm,setSearchTerm] = useState("")
    const [coordinatorSuggestions,setCoordinatorSuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [uploadingImages, setUploadingImages] = useState(false)
    const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [createSuccess, setCreateSuccess] = useState(false)
    const [createError, setCreateError] = useState("")
    useEffect(()=>{
        console.log('inside useEffecr of coordinator suggestions');
        
        if(searchTerm=="") {
            setShowSuggestions(false)
            return;
        }
        getCoordinatorSuggestions();
        setShowSuggestions(true)
    },[searchTerm])

    async function getCoordinatorSuggestions(){
        console.log('inside getCoordinatorSuggestions');
        
        try {
            const {data:response} = await axios.get(`/api/user/search?searchTerm=${searchTerm}`)
            console.log('response received for user suggetions : ',response);
            
            setCoordinatorSuggestions(response.data)
        } catch (error) {
            console.log('Failed to get user suggestions');
        }
    }

    async function handleThumbnailUpload(e) {
        const thumbnailFiles: File[] = Array.from(e.target.files);

        if (thumbnailFiles.length == 0) {
            console.log('No image uploaded');
            return
        } 

        if (!thumbnailFiles[0].type.startsWith("image/")) {
            console.log('Thumbnail can be of image type only');
            return;
        }

        setUploadingThumbnail(true)

        if(thumbnailPublicId!==""){
            axios.delete("/api/images",{
                images:[thumbnailPublicId]
            }).catch((err)=>{})

            setThumnailPublicId("")
        }

        try {
            const response = await uploadToCloudinary(thumbnailFiles[0]);
            const thumbnailUrl = response.secure_url
            const newThumbnailPublicId=response.public_id;

            setThumbnail(thumbnailUrl);
            setThumnailPublicId(newThumbnailPublicId)

            axios.post("/api/images",{
                images:[newThumbnailPublicId]
            }).catch((err)=>{})

            setAddThumbnail(false)

        } catch (error) {
            console.log('Failed to upload thumbnail try again');
        } finally {
            setUploadingThumbnail(false)
        }
    }

    async function onImagesUpload(e) {
        const uploadedFiles: File[] = Array.from(e.target.files)

        const validFiles: File[] = uploadedFiles.filter(file => {
            return file.type.startsWith("image/")
        })

        if (validFiles.length !== uploadedFiles.length) {
            console.log('Only image files are alowed here, provide yt video links if you want to add videos');
        }

        if (validFiles.length > 0) {
            setUploadingImages(true)
            const newResponses:IImageCloudinaryResponse[] = []
            const newImageUrls:string[]=[]
            const newImagesPublicIds:string[]=[]
            for (let i = 0; i < validFiles.length; i++) {
                try {
                    const response = await uploadToCloudinary(validFiles[i]);
                    const secure_url=response.secure_url;
                    const public_id=response.public_id;

                    newResponses.push({secure_url,public_id});
                    newImageUrls.push(secure_url)
                    newImagesPublicIds.push(public_id)

                } catch (error) {
                    console.log('Failed to upload : ', validFiles[i].name);
                }
            }

            axios.post("/api/images",{
                images:newImagesPublicIds
            })

            setImageUrls([...imageUrls,...newImageUrls])
            setImagesCloudinaryResponses([...imagesCloudinaryResponses,...newResponses])
            setUploadingImages(false)
        }
    }

    async function handleAddYtVideoLink() {
        const parsed = linkSchema.safeParse(ytVideoLink);
        if (!parsed.success) {
            console.log('invalid youtube link format');
            return;
        }

        const ytLink = parsed.data;
        const newVideos = [...videos, ytLink];
        setVideos(newVideos)

        console.log('added yt video link ND');
        setYtVideoLink("")
        setAddYtVideoLink(false);
    }

    async function uploadToCloudinary(file: File) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "ADCET_PCS");

        try {
            const response = await fetch("https://api.cloudinary.com/v1_1/dtclftrxs/image/upload", {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.log('error from cloudinary : ', error);
            throw error;
        }
    }

    async function handleCreateEvent() {
        setIsCreating(true)
        setCreateError("")
        setCreateSuccess(false)

        const data = {
            title,
            description,
            images: imageUrls,
            videos,
            credits,
            thumbnail,
            createdAt: createdAt,
            mentorId:session?.user.id
        }

        const parsed = createEventSchema.safeParse(data)

        if (!parsed.success) {
            console.log('Invalid data format: ', parsed.error);
            return;
        }

        try {
            const { data: response } = await axios.post("/api/event", parsed.data)
            console.log('Event created successfully');
            const eventId=response.data.id;
            console.log('eventId :',eventId);
            
             setCreateSuccess(true)
            // Optional: redirect after success
            setTimeout(() => router.push('/events/'+eventId), 2000)
        } catch (error) {
            console.log('Failed to creat event : ', error);
             console.log('Failed to create event : ', error);
            setCreateError("Failed to create event. Please try again.")
        }  finally{
            setIsCreating(false)

        }
    }

    async function handleAddCredit(e){
        const newCoordinatorId=e.target.value
        if(!creditTitle || !newCoordinatorId)return;

        if(credits[creditTitle]){
            if(!credits[creditTitle].includes(newCoordinatorId)){
                credits[creditTitle].push(newCoordinatorId)
            }
        } else {
            credits[creditTitle]=[newCoordinatorId]
        }

        const newCredits={...credits};
        setCredits(newCredits)
        setSearchTerm("")
        setShowSuggestions(false)
    }

    async function handleDeleteImage(index: number, publicId: string) {
        try {
            await axios.delete("/api/images", {
                data: { images: [publicId] }
            });
            
            const newImageUrls = imageUrls.filter((_, i) => i !== index);
            const newImagesCloudinaryResponses = imagesCloudinaryResponses.filter((_, i) => i !== index);
            
            setImageUrls(newImageUrls);
            setImagesCloudinaryResponses(newImagesCloudinaryResponses);
        } catch (error) {
            console.log('Failed to delete image:', error);
        }
    }

    async function handleDeleteVideo(index: number) {
        const newVideos = videos.filter((_, i) => i !== index);
        setVideos(newVideos);
    }

    function handleDeleteCredit(creditTitle: string, coordinatorId: string) {
        const newCredits = { ...credits };
        if (newCredits[creditTitle]) {
            newCredits[creditTitle] = newCredits[creditTitle].filter(id => id !== coordinatorId);
            if (newCredits[creditTitle].length === 0) {
                delete newCredits[creditTitle];
            }
        }
        setCredits(newCredits);
    }

    function BringItUp(index:number){
        if(index==0)return;

        const tempImageUrl = imageUrls[index];
        imageUrls[index]=imageUrls[index-1]
        imageUrls[index-1]=tempImageUrl;

        const tempCLDresponse = imagesCloudinaryResponses[index];
        imagesCloudinaryResponses[index]=imagesCloudinaryResponses[index-1];
        imagesCloudinaryResponses[index-1]=tempCLDresponse

        const newImageUrls=[...imageUrls]
        const newCLDresponses=[...imagesCloudinaryResponses]

        setImageUrls(newImageUrls)
        setImagesCloudinaryResponses(newCLDresponses)
    }

    function BringItDown(index:number){
        if(index==imageUrls.length-1)return;

        const tempImageUrl = imageUrls[index];
        imageUrls[index]=imageUrls[index+1]
        imageUrls[index+1]=tempImageUrl;

        const tempCLDresponse = imagesCloudinaryResponses[index];
        imagesCloudinaryResponses[index]=imagesCloudinaryResponses[index+1];
        imagesCloudinaryResponses[index+1]=tempCLDresponse

        const newImageUrls=[...imageUrls]
        const newCLDresponses=[...imagesCloudinaryResponses]

        setImageUrls(newImageUrls)
        setImagesCloudinaryResponses(newCLDresponses)
    }

    const getYouTubeEmbedUrl = (url: string) => {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? `https://www.youtube.com/embed/${match[1]}` : null;
    }

    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
    }

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                            <Plus className="h-6 w-6 mr-2 text-blue-600" />
                            Create New Event
                        </h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Share your event with the ADCET community
                        </p>
                    </div>

                    <div className="p-6 space-y-8">
                        {/* Basic Information */}
                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                                Basic Information
                            </h2>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Event Title
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter event title"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Describe your event..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Event Date
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="date"
                                            value={formatDate(createdAt)}
                                            onChange={(e) => setCreatedAt(new Date(e.target.value))}
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Media Section */}
                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                <ImageIcon className="h-5 w-5 mr-2 text-blue-600" />
                                Media
                            </h2>

                            {/* Thumbnail */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Event Thumbnail (Optional)
                                </label>
                                {thumbnail ? (
                                    <div className="relative inline-block">
                                        <img src={thumbnail} alt="Thumbnail" className="w-32 h-32 object-cover rounded-lg" />
                                        <button
                                            onClick={() => {
                                                setThumbnail("");
                                                setThumnailPublicId("");
                                            }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        {addThumbnail ? (
                                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleThumbnailUpload}
                                                    className="w-full"
                                                    disabled={uploadingThumbnail}
                                                />
                                                {uploadingThumbnail && (
                                                    <div className="flex items-center mt-2 text-blue-600">
                                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                        Uploading...
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setAddThumbnail(true)}
                                                className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                Add Thumbnail
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Images */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Event Images
                                </label>
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-4">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={onImagesUpload}
                                        className="w-full"
                                        disabled={uploadingImages}
                                    />
                                    {uploadingImages && (
                                        <div className="flex items-center mt-2 text-blue-600">
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Uploading images...
                                        </div>
                                    )}
                                </div>

                                {imageUrls.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {imageUrls.map((imageUrl, index) => (
                                            <div key={imageUrl} className="relative group">
                                                <img
                                                    src={imageUrl}
                                                    alt={`Event image ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded-lg"
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                    <div className="flex space-x-1">
                                                        <button
                                                            onClick={() => BringItUp(index)}
                                                            disabled={index === 0}
                                                            className="p-1 bg-white rounded text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <ArrowUp className="h-3 w-3" />
                                                        </button>
                                                        <button
                                                            onClick={() => BringItDown(index)}
                                                            disabled={index === imageUrls.length - 1}
                                                            className="p-1 bg-white rounded text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <ArrowDown className="h-3 w-3" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteImage(index, imagesCloudinaryResponses[index].public_id)}
                                                            className="p-1 bg-red-500 rounded text-white hover:bg-red-600"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Videos */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Video Links
                                </label>
                                <div className="mb-4">
                                    {addYtVideoLink ? (
                                        <div className="flex space-x-2">
                                            <input
                                                type="text"
                                                value={ytVideoLink}
                                                onChange={(e) => setYtVideoLink(e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Enter YouTube or video link"
                                            />
                                            <button
                                                onClick={handleAddYtVideoLink}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                                            >
                                                Add
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setAddYtVideoLink(false);
                                                    setYtVideoLink("");
                                                }}
                                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setAddYtVideoLink(true)}
                                            className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            <Video className="h-4 w-4 mr-2" />
                                            Add Video Link
                                        </button>
                                    )}
                                </div>

                                {videos.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {videos.map((video, index) => {
                                            const embedUrl = getYouTubeEmbedUrl(video);
                                            return (
                                                <div key={index} className="relative group">
                                                    {embedUrl ? (
                                                        <iframe
                                                            src={embedUrl}
                                                            className="w-full h-24 rounded-lg"
                                                            frameBorder="0"
                                                            allowFullScreen
                                                        />
                                                    ) : (
                                                        <div className="w-full h-24 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                                            <Video className="h-8 w-8 text-gray-400" />
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteVideo(index)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Credits & Coordinators */}
                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                <Award className="h-5 w-5 mr-2 text-blue-600" />
                                Credits & Coordinators
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Credit Title
                                    </label>
                                    <input
                                        type="text"
                                        value={creditTitle}
                                        onChange={(e) => setCreditTitle(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., Event Coordinator, Photographer"
                                    />
                                </div>
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Search Coordinator
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onFocus={() => searchTerm && setShowSuggestions(true)}
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Search for coordinators"
                                        />
                                    </div>

                                    {showSuggestions && coordinatorSuggestions.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                            {coordinatorSuggestions.map((coordinator) => (
                                                <button
                                                    key={coordinator.id}
                                                    onClick={() => handleAddCredit({ target: { value: coordinator.id } })}
                                                    className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center space-x-3"
                                                >
                                                    <img
                                                        src={coordinator.image || '/default-avatar.png'}
                                                        alt={coordinator.username}
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                    <span className="text-gray-900 dark:text-white">{coordinator.username}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Display Credits */}
                            {Object.keys(credits).length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-md font-medium text-gray-900 dark:text-white">Added Credits</h3>
                                    {Object.entries(credits).map(([creditTitle, coordinatorIds]) => (
                                        <div key={creditTitle} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">{creditTitle}</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {coordinatorIds.map((coordinatorId) => {
                                                    const coordinator = coordinatorSuggestions.find(c => c.id === coordinatorId);
                                                    return (
                                                        <div
                                                            key={coordinatorId}
                                                            className="flex items-center space-x-2 bg-white dark:bg-gray-600 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-500"
                                                        >
                                                            <img
                                                                src={coordinator?.image || '/default-avatar.png'}
                                                                alt={coordinator?.username || 'User'}
                                                                className="w-6 h-6 rounded-full object-cover"
                                                            />
                                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                                {coordinator?.username || 'Unknown User'}
                                                            </span>
                                                            <button
                                                                onClick={() => handleDeleteCredit(creditTitle, coordinatorId)}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Submit Button */}
                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => router.back()}
                                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                            >
                                Cancel
                            </button>
                            {/* Success/Error Messages */}
                            {createSuccess && (
                                <div className="bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 rounded-md p-3">
                                    <div className="flex">
                                        <CheckCircle className="h-5 w-5 text-green-400" />
                                        <div className="ml-3">
                                            <p className="text-sm text-green-800 dark:text-green-200">Event created successfully! Redirecting...</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {createError && (
                                <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-md p-3">
                                    <div className="flex">
                                        <AlertCircle className="h-5 w-5 text-red-400" />
                                        <div className="ml-3">
                                            <p className="text-sm text-red-800 dark:text-red-200">{createError}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <button
                                onClick={handleCreateEvent}
                                disabled={!title.trim() || !description.trim() || isCreating}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {isCreating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Creating Event...
                                    </>
                                ) : createSuccess ? (
                                    <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Event Created!
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Create Event
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

               
            </div>
        </div>
    );
}

// "use client"

// import { createEventSchema, linkSchema } from "@/schemas"
// import axios from "axios";
// import { useSession } from "next-auth/react"
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react"

// interface IImageCloudinaryResponse{
//     public_id:string,
//     secure_url:string
// }

// export function CreateEvent() {
//     const { data: session, status } = useSession();
//     const router = useRouter();

//     useEffect(() => {
//         if (status == "unauthenticated") {
//             console.log('unauthenticated');
//             alert()
//             router.push("/signin")
//         } else if (status == 'authenticated' && session.user.role !== 'Mentor') {
//             console.log('Only mentors are allowed to create event');
//             console.log('session.user.role :',session.user.role);
            
//             alert();
//             setTimeout(() => {
//                 // router.push('/events')
//             }, 1000)
//         }
//     }, [status, router])

//     const [title, setTitle] = useState("")
//     const [description, setDescription] = useState("")
//     const [thumbnail, setThumbnail] = useState("")
//     const [addThumbnail, setAddThumbnail] = useState(false);
//     const [imageUrls, setImageUrls] = useState<string[]>([])
//     const [imagesCloudinaryResponses, setImagesCloudinaryResponses] = useState<IImageCloudinaryResponse[]>([])
//     const [videos, setVideos] = useState<string[]>([])
//     const [credits, setCredits] = useState({})
//     const [createdAt, setCreatedAt] = useState(new Date)
//     const [addYtVideoLink, setAddYtVideoLink] = useState(false)
//     const [ytVideoLink, setYtVideoLink] = useState("")
//     const [thumbnailPublicId,setThumnailPublicId] = useState("")
//     const [creditTitle,setCreditTitle] = useState("")
//     const [searchTerm,setSearchTerm] = useState("")

//     const [coordinatorSuggestions,setCoordinatorSuggestions] = useState([])

//     useEffect(()=>{
//         console.log('inside useEffecr of coordinator suggestions');
        
//         if(searchTerm=="")return;
//         getCoordinatorSuggestions();

//     },[searchTerm])


//     async function getCoordinatorSuggestions(){
//         console.log('inside getCoordinatorSuggestions');
        
//         try {
//             const {data:response} = await axios.get(`/api/user/search?searchTerm=${searchTerm}`)
//             console.log('response received for user suggetions : ',response);
            
//             setCoordinatorSuggestions(response.data)
//         } catch (error) {
//             console.log('Failed to get user suggestions');
//         }
//     }

//     async function handleThumbnailUpload(e) {

//         const thumbnailFiles: File[] = Array.from(e.target.files);

//         if (thumbnailFiles.length == 0) {
//             console.log('No image uploaded');
//             return
//         } 

//         if (!thumbnailFiles[0].type.startsWith("image/")) {
//             console.log('Thumbnail can be of image type only');
//             return;
//         }

//         if(thumbnailPublicId!==""){
//             axios.delete("/api/images",{
//                 images:[thumbnailPublicId]
//             }).catch((err)=>{})

//             setThumnailPublicId("")
//         }

//         try {
//             const response = await uploadToCloudinary(thumbnailFiles[0]);
//             const thumbnailUrl = response.secure_url
//             const newThumbnailPublicId=response.public_id;

//             setThumbnail(thumbnailUrl);
//             setThumnailPublicId(newThumbnailPublicId)

//             axios.post("/api/images",{
//                 images:[newThumbnailPublicId]
//             }).catch((err)=>{})

//             setAddThumbnail(false)

//         } catch (error) {
//             console.log('Failed to upload thumbnail try again');
//         }
//     }

//     async function onImagesUpload(e) {
//         const uploadedFiles: File[] = Array.from(e.target.files)

//         const validFiles: File[] = uploadedFiles.filter(file => {
//             return file.type.startsWith("image/")
//         })

//         if (validFiles.length !== uploadedFiles.length) {
//             console.log('Only image files are alowed here, provide yt video links if you want to add videos');
//         }

//         if (validFiles.length > 0) {
//             const newResponses:IImageCloudinaryResponse[] = []
//             const newImageUrls:string[]=[]
//             const newImagesPublicIds:string[]=[]
//             for (let i = 0; i < validFiles.length; i++) {
//                 try {
//                     const response = await uploadToCloudinary(validFiles[i]);
//                     const secure_url=response.secure_url;
//                     const public_id=response.public_id;

//                     newResponses.push({secure_url,public_id});
//                     newImageUrls.push(secure_url)
//                     newImagesPublicIds.push(public_id)

//                 } catch (error) {
//                     console.log('Failed to upload : ', validFiles[i].name);
//                 }
//             }

//             axios.post("/api/images",{
//                 images:newImagesPublicIds
//             })

//             setImageUrls([...imageUrls,...newImageUrls])
//             setImagesCloudinaryResponses([...imagesCloudinaryResponses,...newResponses])
//         }

//     }

//     async function handleAddYtVideoLink() {
//         const parsed = linkSchema.safeParse(ytVideoLink);
//         if (!parsed.success) {
//             console.log('invalid youtube link format');
//             return;
//         }

//         const ytLink = parsed.data;
//         const newVideos = [...videos, ytLink];
//         setVideos(newVideos)

//         console.log('added yt video link ND');
//         setYtVideoLink("")
//         setAddYtVideoLink(false);
//     }

//     async function uploadToCloudinary(file: File) {
//         const formData = new FormData();
//         formData.append("file", file);
//         formData.append("upload_preset", "ADCET_PCS");

//         try {
//             const response = await fetch("https://api.cloudinary.com/v1_1/dtclftrxs/image/upload", {
//                 method: 'POST',
//                 body: formData
//             });
//             const data = await response.json();
//             return data;
//         } catch (error) {
//             console.log('error from cloudinary : ', error);
//             throw error;
//         }
//     }

//     async function handleCreateEvent() {

//         const data = {
//             title,
//             description,
//             images: imageUrls,
//             videos,
//             credits,
//             thumbnail,
//             createdAt: new Date(),
//             mentorId:session?.user.id
//         }

//         const parsed = createEventSchema.safeParse(data)

//         if (!parsed.success) {
//             console.log('Invalid data format: ', parsed.error);
//             return;
//         }

//         try {
//             const { data: response } = await axios.post("/api/event", parsed.data)
//             console.log('Event created successfully');
//         } catch (error) {
//             console.log('Failed to creat event : ', error);
//         }
//     }

//     async function handleAddCredit(e){
//         const newCoordinatorId=e.target.value
//         if(!creditTitle || !newCoordinatorId)return;

//         if(credits[creditTitle]){
//             if(!credits[creditTitle].includes(newCoordinatorId)){
//                 credits[creditTitle].push(newCoordinatorId)
//             }
//         } else {
//             credits[creditTitle]=[newCoordinatorId]
//         }

//         const newCredits={...credits};
//         setCredits(newCredits)
//     }

//     function BringItUp(index:number){
//         if(index==0)return;

//         const tempImageUrl = imageUrls[index];
//         imageUrls[index]=imageUrls[index-1]
//         imageUrls[index-1]=tempImageUrl;

//         const tempCLDresponse = imagesCloudinaryResponses[index];
//         imagesCloudinaryResponses[index]=imagesCloudinaryResponses[index-1];
//         imagesCloudinaryResponses[index-1]=tempCLDresponse

//         const newImageUrls=[...imageUrls]
//         const newCLDresponses=[...imagesCloudinaryResponses]

//         setImageUrls(newImageUrls)
//         setImagesCloudinaryResponses(newCLDresponses)
//     }

//     function BringItDown(index:number){
//         if(index==imageUrls.length-1)return;

//         const tempImageUrl = imageUrls[index];
//         imageUrls[index]=imageUrls[index+1]
//         imageUrls[index+1]=tempImageUrl;

//         const tempCLDresponse = imagesCloudinaryResponses[index];
//         imagesCloudinaryResponses[index]=imagesCloudinaryResponses[index+1];
//         imagesCloudinaryResponses[index+1]=tempCLDresponse

//         const newImageUrls=[...imageUrls]
//         const newCLDresponses=[...imagesCloudinaryResponses]

//         setImageUrls(newImageUrls)
//         setImagesCloudinaryResponses(newCLDresponses)
//     }

//     return (
//         <>
//             <input type="text" placeholder="Enter title" value={title} onChange={(e) => setTitle(e.target.value)} />
//             <input type="text" placeholder="Enter description" value={description} onChange={(e) => setDescription(e.target.value)} />
//             {
//                 addThumbnail ? (
//                     <>
//                         <input type="file" onChange={handleThumbnailUpload} />
//                     </>
//                 ):(
//                     <button onClick={()=>setAddThumbnail(true)}>Add thumbnail for event</button>
//                 )
//             }
//             <p>You can also add youtube video links <button onClick={() => setAddYtVideoLink(true)}>Add YT video link</button></p>
//             {addYtVideoLink &&
//                 (
//                     <>
//                         <input type="text" placeholder={'Enter youtube video link'} value={ytVideoLink} onChange={(e) => setYtVideoLink(e.target.value)} />
//                         <button onClick={handleAddYtVideoLink}>Add yt video link</button>
//                     </>
//                 )
//             }

//             <label>Upload images of the event</label>
//             <input type="file" multiple onChange={onImagesUpload}/>

//             <input type="text" placeholder="Enter credit title" value={creditTitle} onChange={(e)=>setCreditTitle(e.target.value)}/>
//             <input type="text" placeholder="Search coordinator" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)}/>
//             <select value={""} onChange={handleAddCredit}>
//                 {coordinatorSuggestions.map((coordinator)=>(
//                     <option key={coordinator.id} value={coordinator.id}>{coordinator.username}</option>
//                 ))}
//             </select>
//             <button onClick={handleCreateEvent}>Create Event</button>
//             {
//                 imageUrls && imageUrls.map((imageUrl,index)=>(
//                     <div key={imageUrl}>
//                         <img src={imageUrl} />
//                         <button onClick={()=>BringItUp(index)}>Bring Up</button>
//                         <button onClick={()=>BringItDown(index)}>Bring Down</button>
//                     </div>
//                 ))
//             }

//              <p>Images URLS</p>
//             ({JSON.stringify(imageUrls)})


//             <p>Images CLD responses</p>
//             ({JSON.stringify(imagesCloudinaryResponses)})


//             <p>Credits</p>
//             ({JSON.stringify(credits)})

//             <p>Coordinators suggestions</p>
//             ({JSON.stringify(coordinatorSuggestions)})
            
//         </>
//     )
// }