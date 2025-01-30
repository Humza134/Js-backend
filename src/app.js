import express, { urlencoded } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express({limit: "16kb"}))
app.use(express(urlencoded({extended:true, limit: "16kb"})))
app.use(express.static("public"))
app.use(cookieParser())
app.use(bodyParser.json())

// routes import

import userRouter from './routes/user.routes.js'
import videoRouter from "./routes/video.routes.js"

app.use("/api/v1/users", userRouter)
// http://localhost:8000/api/v1/users/register

app.use("/api/v1/videos", videoRouter)

export { app }