const mongoose = require('mongoose')
const  validator = require('validator')

const taskSchema = new mongoose.Schema(
    {
        description: {
            type: String,
            required: true,
            trim: true,
            minlength: 1    
        },
        completed:{
            type: Boolean,
            default: false
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref : 'User'
        }
        
    },
    {
        timestamps: true
    }
)

// Create a model for tasks with validation
const Task = mongoose.model('Task', taskSchema)

module.exports = Task
// console.log(typeof(Task))