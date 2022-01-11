const express = require('express')
const { sendWelcomeEmail } = require('../emails/account')
const { sendCancelationEmail } = require('../emails/account')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')


// Add new user
router.post('/users', async (req,res) => {
    const user = new User(req.body)

    try{
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
        console.log(user.name + ' was created succesful!')
    }catch(e){
        res.status(400).send(e.message)
        console.log(e.message)
    }
})

// Show all users
router.get('/users', async (req,res) => {
    //refactor with async/await
    try{
        const users = await User.find({})
        res.status(201).send(users)
        // console.log('Find all results')
    }catch(e){
        res.status(500).send(e.message)
    }

    // User.find({}).then((users) => {
    //     res.send(users)
    // }).catch((error) => {
    //     res.status(500).send()
    // })
})

// Show user profile
router.get('/users/me', auth,  async (req,res) => {
    res.send(req.user)
})

// Find a user with ID
router.get('/users/:id', async (req,res) => {
    // console.log(req.params)
    const _id = req.params.id
    //refactor with async/await
    try{
        const user = await User.findById(_id)
        if(!user){
            return res.status(404).send()
        }
        res.status(201).send(user)
        // console.log('Found a result')
    }catch(e){
        res.status(500).send(e.message)
    }

    // User.findById(_id).then((user) => {
    //     if(!user){
    //         return res.status(404).send()
    //     }
    //     res.send(user)
    // }).catch((e) =>{
    //     res.status(500).send()
    // })
})

// Update a user with id
router.patch("/users/me", auth, async (req,res) =>{
    const id = req.params.id

    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'age', 'password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({error : 'Invalid updates!'})
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (error) {
        res.status(400).send(error)
    }
})

// Delete a user with id
router.delete('/users/me', auth, async (req,res) => {
    try {
        // const user = await User.findByIdAndDelete(req.params.id)
        // if(!user){
        //     return res.status(404).send('Not found this user')
        // }
        await req.user.remove()
        sendCancelationEmail(req.user.email, req.user.name)
        res.status(200).send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})

// Login in Users
router.post('/users/login' , async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        
        res.send({user, token})
    } catch (error) {
        res.status(400).send(error)
    }
})

// Log out in Users
router.post('/users/logout' , auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send(req.user)
    } catch (error) {
        res.status(500).send()
    }
})

// Logout all seasion
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send('Log out')
    } catch (error) {
        res.status(500).send(error)
    }
})

const upload = multer({
    
    limits:{
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error(' File must be a image file such as: jpg, jpeg, png'))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req,res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()

    req.user.avatar = buffer
    await req.user.save()
    res.send('Avatar was upload successful')
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth, async (req, res)=> {
    req.user.avatar = undefined
    await req.user.save()
    res.send('Avatar was deleted')
})

// show exist avatar of user by id
router.get('/users/:id/avatar', async (req , res) => {
    try {
         const user = await User.findById(req.params.id)

         if(!user || !user.avatar){
            throw new Error()
         }
         res.set('Content-Type', 'image/jpg')
         res.send(user.avatar)
    } catch (error) {
        res.status(404).send()
    }
} )
module.exports = router