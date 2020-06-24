//Model to store the details of the images Uploaded 

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const photoSchema = new Schema({
    filename: String,
    imgName: String, 
    imgPath: String,
    user: String,
    category: String,
    size: Number
}, {
    timestamps: {
        createdAt: "dateUpload", 
        updatedAt: "dateUpdate"
    }
})

var Photo = mongoose.model("Photo", photoSchema)

module.exports = Photo;



