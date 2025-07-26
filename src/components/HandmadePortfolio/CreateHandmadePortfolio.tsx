"use client"

import { useState } from "react";
import { Upload, Image, ArrowUp, ArrowDown, X, FileText, CheckCircle, AlertCircle, Camera, Plus } from "lucide-react";

export default function CreateHandmadePortfolio() {
    const [title, setTitle] = useState("");
    const [files, setFiles] = useState([]);
    const [preview, setPreview] = useState([]);
    const [urls, setUrls] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitStatus, setSubmitStatus] = useState('');
    const [serverMessage, setServerMessage] = useState('');

    const validateForm = () => {
        const newErrors = {};

        if (!title.trim()) {
            newErrors.title = 'Portfolio title is required';
        } else if (title.length < 3) {
            newErrors.title = 'Title must be at least 3 characters';
        } else if (title.length > 100) {
            newErrors.title = 'Title must be less than 100 characters';
        }

        if (files.length === 0) {
            newErrors.files = 'Please select at least one image';
        }

        return newErrors;
    };

    async function handleAdd(e) {
        setErrors({});
        setSubmitStatus('');
        
        const selectedFiles = Array.from(e.target.files);
        
        // Validate file types
        const validFiles = selectedFiles.filter(file => {
            return file.type.startsWith('image/');
        });

        if (validFiles.length !== selectedFiles.length) {
            setErrors({ files: 'Only image files are allowed' });
            return;
        }

        setFiles(validFiles);

        if (validFiles.length > 0) {
            const filesArr = Array.from(validFiles);
            const images = filesArr.map((file) => URL.createObjectURL(file));
            setPreview(images);
        }
    }

    async function uploadToCloudinary(file) {
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

    async function handleUpload() {
        setServerMessage('');
        setSubmitStatus('');
        
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);
        const uploadedUrls = [];

        try {
            // Upload images to Cloudinary
            for (let i = 0; i < files.length; i++) {
                try {
                    const response = await uploadToCloudinary(files[i]);
                    uploadedUrls.push(response.secure_url);
                } catch (error) {
                    console.log('failed to upload image : ', files[i].name);
                    setSubmitStatus('error');
                    setServerMessage(`Failed to upload ${files[i].name}`);
                    setIsLoading(false);
                    return;
                }
            }

            // Send to backend
            const response = await fetch("/api/handmade-portfolio", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    images: uploadedUrls
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSubmitStatus('success');
                setServerMessage('Handmade portfolio uploaded successfully!');
                // Reset form
                setFiles([]);
                setPreview([]);
                setTitle('');
                setUrls([]);
                setErrors({});
            } else {
                setSubmitStatus('error');
                setServerMessage(data.message || 'Failed to upload portfolio');
            }
        } catch (error) {
            setSubmitStatus('error');
            setServerMessage('Network error. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    }

    function bringItUp(index) {
        if (index === 0) return;

        const newPreview = [...preview];
        const newFiles = [...files];

        // Swap elements
        [newPreview[index], newPreview[index - 1]] = [newPreview[index - 1], newPreview[index]];
        [newFiles[index], newFiles[index - 1]] = [newFiles[index - 1], newFiles[index]];

        setPreview(newPreview);
        setFiles(newFiles);
    }

    function bringItDown(index) {
        if (index === preview.length - 1) return;

        const newPreview = [...preview];
        const newFiles = [...files];

        // Swap elements
        [newPreview[index], newPreview[index + 1]] = [newPreview[index + 1], newPreview[index]];
        [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];

        setPreview(newPreview);
        setFiles(newFiles);
    }

    function removeImage(index) {
        const newPreview = preview.filter((_, i) => i !== index);
        const newFiles = files.filter((_, i) => i !== index);
        setPreview(newPreview);
        setFiles(newFiles);
        
        // Clear file errors if files exist
        if (newFiles.length > 0 && errors.files) {
            setErrors(prev => ({ ...prev, files: '' }));
        }
    }

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
        
        // Clear title error when user starts typing
        if (errors.title) {
            setErrors(prev => ({ ...prev, title: '' }));
        }
        
        // Reset submit status when user starts editing
        if (submitStatus) {
            setSubmitStatus('');
            setServerMessage('');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Camera className="w-10 h-10 text-purple-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Create Handmade Portfolio</h1>
                    <p className="text-gray-600 text-lg">Showcase your creative work through images</p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                    {/* Success/Error Messages */}
                    {submitStatus === 'success' && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-green-700 font-medium">{serverMessage}</span>
                        </div>
                    )}

                    {submitStatus === 'error' && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <span className="text-red-700 font-medium">{serverMessage}</span>
                        </div>
                    )}

                    <div className="space-y-8">
                        {/* Title Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Portfolio Title <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={title}
                                    onChange={handleTitleChange}
                                    className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-lg text-gray-800 placeholder-gray-400 ${
                                        errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }`}
                                    placeholder="e.g., My Art Collection 2024"
                                    maxLength="100"
                                />
                            </div>
                            {errors.title && <p className="text-red-500 text-sm mt-2 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                {errors.title}
                            </p>}
                            <p className="text-gray-500 text-sm mt-2">
                                {title.length}/100 characters
                            </p>
                        </div>

                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Upload Images <span className="text-red-500">*</span>
                            </label>
                            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                                errors.files ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-purple-400 bg-gray-50 hover:bg-purple-50'
                            }`}>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleAdd}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-lg font-medium text-gray-600 mb-2">
                                        Click to upload images
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Support: JPG, PNG, GIF (Multiple files allowed)
                                    </p>
                                </label>
                            </div>
                            {errors.files && <p className="text-red-500 text-sm mt-2 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                {errors.files}
                            </p>}
                        </div>

                        {/* Image Preview Grid */}
                        {preview.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                                    Image Preview ({preview.length} {preview.length === 1 ? 'image' : 'images'})
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    📋 Tip: Use arrow buttons to reorder images. The first image will be your cover image.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {preview.map((url, index) => (
                                        <div key={url} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all">
                                            <div className="relative mb-3">
                                                <img
                                                    src={url}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-48 object-cover rounded-lg shadow-sm"
                                                />
                                                <button
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                                {index === 0 && (
                                                    <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                                                        Cover
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-600">
                                                    Image {index + 1}
                                                </span>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => bringItUp(index)}
                                                        disabled={index === 0}
                                                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        <ArrowUp className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => bringItDown(index)}
                                                        disabled={index === preview.length - 1}
                                                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        <ArrowDown className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            onClick={handleUpload}
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Uploading Portfolio...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center space-x-2">
                                    <Plus className="w-5 h-5" />
                                    <span>Create Handmade Portfolio</span>
                                </div>
                            )}
                        </button>
                    </div>
                </div>

                {/* Guidelines Card */}
                <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100">
                    <h3 className="font-semibold text-gray-800 mb-3">Portfolio Guidelines</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start space-x-2">
                            <span className="text-purple-500 font-bold">•</span>
                            <span>Upload high-quality images that best represent your work</span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="text-purple-500 font-bold">•</span>
                            <span>The first image will be used as your portfolio cover</span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="text-purple-500 font-bold">•</span>
                            <span>Use the arrow buttons to reorder images in your preferred sequence</span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="text-purple-500 font-bold">•</span>
                            <span>Supported formats: JPG, PNG, GIF</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

// "use client"

// import { useState } from "react";
// import axios from "axios"

// export default function CreateHandmadePortfolio(){
//     const [title,setTitle]=useState("")
//     const [files,setFiles]=useState([])
//     const [preview,setPreview]=useState([])
//     const [urls,setUrls]=useState([])

//     async function handleAdd(e: React.ChangeEvent<HTMLInputElement>){
//         const files = Array.from(e.target.files);
        
//         setFiles(files)

//         if(files){
//             const filesArr=Array.from(files);
//             const images=filesArr.map((file)=>URL.createObjectURL(file));
//             setPreview(images)
//             console.log('preview files : ',images);
//         }
        
//         console.log('uploded files : ',e.target.files);
//     }

//     async function uploadToCloudinary(file:File){
//         const formData= new FormData();
//         formData.append("file",file);
//         formData.append("upload_preset","ADCET_PCS");
        
//         try {
//             const {data:response} = await axios.post("https://api.cloudinary.com/v1_1/dtclftrxs/image/upload",formData,)
//             return response
//         } catch (error) {
//             console.log('error from cloudinary : ',error) 
//             return error           
//         }
//     }

//     async function handleUpload(){
//         console.log('inside handleUpload');
//         for(let i=0;i<files.length;i++){
//             try {
//                 const response=await uploadToCloudinary(files[i])
//                 urls.push(response.secure_url)
//             } catch (error) {
//                 console.log('failed to upload image : ',files[i].name);
//             }
//         }
//         const temp=[...urls]
//         setUrls(temp)

//         try {
//             const {data:response}=await axios.post("/api/handmade-portfolio",{
//                 title,
//                 images:temp
//             })
//             console.log('handmade-portfolio uploaded successfully : ');
//             console.log('response received from backend : ',response);
//             setFiles([]);
//             setPreview([])
//         } catch (error) {
//             console.log('error uploading handmade-portfolio : ',error.response);
//         }

//     }

//     function bringItUp(index:number){
//         if(index==0)return;

//         const temp=preview[index];
//         preview[index]=preview[index-1];
//         preview[index-1]=temp;

//         const temp2=files[index];
//         files[index]=files[index-1];
//         files[index-1]=temp2;

//         const arr=[...preview];
//         const arr2=[...files]

//         setPreview(arr)
//         setFiles(arr2);
//     }

//     function bringItDown(index:number){
//         if(index==preview.length-1)return;

//         const temp=preview[index];
//         preview[index]=preview[index+1];
//         preview[index+1]=temp;

//         const temp2=files[index];
//         files[index]=files[index+1];
//         files[index+1]=temp;

//         const arr=[...preview];
//         const arr2=[...files]

//         setPreview(arr)
//         setFiles(arr2)
//     }

//     return (
//         <>
//             <input type="text" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Enter title"/>
//             <input type="file" multiple onChange={handleAdd}/>
//             <button onClick={handleUpload}>Upload Handmade-Portfolio</button>
//             {
//                 preview.length!=0 && (
//                     preview.map((url,index)=>(
//                         <div key={url}>
//                             <button onClick={()=>bringItUp(index)}>bring it up</button>
//                             <button onClick={()=>bringItDown(index)}>bring it down</button>
//                             <img src={url}/>
//                         </div>
//                     ))
//                 )
//             }
//         </>
//     )
// }