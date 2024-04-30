import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"



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

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}