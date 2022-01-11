const mongoose = require('mongoose')
const  validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 4,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        validate(email){
            if(!validator.isEmail(email)){
               throw new Error('Email is invalid') 
            }
        },
        lowercase: true,
        trim: true
    },
    age : {
        type : Number,
        default: 0,
        validate(value) {
            if(value <= 0){
                throw new Error('Age must be a postive number')
            }
        }
    },
    //make password field with require string, greater 6 characters, trim space, not contain "password"
    password : {
        type : String,
        required: true,
        minlength: 7,
        validate(password){
            if(password.toLowerCase().includes('password')){
                throw new Error('Password cannot contain "password"')
            }
        },
        trim: true,
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer,
       
    }
},{
    timestamps: true
})

// create virtual property
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}
// generate token for password
userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email})

    if(!user){
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error('Unable to login')
    }

    return user
}

// Hash the plain text pass before saving
userSchema.pre('save', async function(next){
    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()


})

// Delete user tasks when user is removed
userSchema.pre('remove', async function(next){
    const user = this
    await Task.deleteMany({owner: user._id})
    next()
})
// Insert document with Mongoose
const User = mongoose.model('User', userSchema)

module.exports = User