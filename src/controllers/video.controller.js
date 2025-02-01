import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary, DeleteFromCloudinary} from "../utils/cloudinary.js"



const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body

    if(!title && !description) {
        throw new ApiError(400, "All fields are required")
    }

    console.log("reqFiles: ", req.files)
    const videoFileLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if(!videoFileLocalPath && !thumbnailLocalPath) {
        throw new ApiError(400, "Video and thumbnail are required")
    }
    
    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    console.log("VIDEOFILE: ", videoFile)

    if(!videoFile && !thumbnail) {
        throw new ApiError(500, "Error while uploading video and thumbnail")
    }

    const video = await Video.create({
        title,
        description,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        duration: Math.floor(videoFile.duration),
        owner: req.user._id
    })

    if(!video) {
        throw new ApiError(500, "Error while creating video")
    }

    return res
    .status(201)
    .json(new ApiResponse(201, video, "Video created successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }

    const video = await Video.findById(new mongoose.Types.ObjectId(videoId))
    if (!video) {
        throw new ApiError(404, "Video is not found")
    }

    return res.status(201).json(
        new ApiResponse(200, video, "Video retrieved successfully")
    )
})

const updateVideoDetails = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "Video Id is required")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video is not found")
    }

    if(!title?.trim() && !description?.trim()) {
        throw new ApiError (400, "Title and descriptoin is required")
    }

    console.log("UserId: ", req.user._id, "VideoOwner: ", video.owner)

    if (!video.owner.toString() === req.user._id.toString()) {
        throw new ApiError(401, "Only owner can update the video")
    }

    const updateVideo = await Video.findByIdAndUpdate(videoId, {
        $set: {
          title,
          description
        }
      },
        {
          new: true
        })

    if (!updateVideo) {
        throw new ApiError(500, "Failed to update video details")
    }

    return res.status(200).json(
        new ApiResponse(200, updateVideo, "Video Updated successfully")
    )
    

})

const updateVideoThumbnail = asyncHandler(async (req, res) => {
    const { videoId } = req.params
   
    if (!videoId) {
        throw new ApiError(400, "Video is required")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }


    if(!video.owner.toString() === req.user._id.toString()) {
        throw new ApiError (401, "Only owner can update video")
    }

    // console.log("REQFILE: ", req.files)
    // const thumbnailLocalPath = req.files?.path

    let thumbnailLocalPath
    if(req.files && req.files.path) {
        thumbnailLocalPath = req.files?.path
    }


    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required")
    }

    // const tempUri = video.thumbnail

    const thumbnailUrl = await uploadOnCloudinary(thumbnailLocalPath)
    if (!thumbnailUrl) {
        throw new ApiError(400, "Error while uploading thumbnail in cloudinary")
    }

    // await DeleteFromCloudinary(tempUri)

    const updateThumbnail = await Video.findByIdAndUpdate(videoId, {
        $set: {
            thumbnail: thumbnailUrl.url
            }
        },
        {
        new: true
        }
    )

    if (!updateThumbnail) {
        throw new ApiError(500, "Failed to update thumbanil")
    }

    return res.status(201).json(
        new ApiResponse(200, "Thumbnail updated successfully")
    )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "Video id is required")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "video not found")
    }

    const {isPublishedStatus} = req.body

    if (!video.owner.toString() === req.user._id.toString()) {
        throw new ApiError(401, "only owner can update the video")
    }

    const updateStatus = await Video.findByIdAndUpdate(
        videoId,
        {isPublished: isPublishedStatus},
        {new: true}
    )

    if (!updateStatus) {
        throw new ApiError(401, "Failed to update status")
    }

    return res.status(200).json(
        new ApiResponse(200, updateStatus, "status updated successfully") 
    )

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideoDetails,
    deleteVideo,
    togglePublishStatus,
    updateVideoThumbnail
}