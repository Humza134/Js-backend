import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideoDetails,
    updateVideoThumbnail,
} from "../controllers/video.controller.js"
import {varifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();
router.use(varifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").get(getAllVideos)
    
    
router.route("/publish-video").post(
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        },
        
    ]),
    publishAVideo
);

router.route("/:videoId").get(getVideoById)
router.route("/delete-video/:videoId").delete(deleteVideo)
router.route("/update-video/:videoId").post(updateVideoDetails)   
router.route("/update-thumbnail/:videoId").patch(upload.single("thumbnail"), updateVideoThumbnail);


router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router