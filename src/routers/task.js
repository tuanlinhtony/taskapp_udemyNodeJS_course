const express = require('express')
const router = new express.Router()
const Task = require('../models/task')
const auth = require('../middleware/auth')
// Create a new task
router.post('/tasks', auth, async (req,res) => {
   
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    //refactor with async/await
    try{
        await task.save()
        res.status(201).send(task)
    }catch(e){
        res.status(500).send(e)
    }
})

// Show all tasks, 
// Get /tasks?completed=false
// GET /tasks?limit=2&skip=6
// GET /tasks?sortBy=createAt: desc
router.get("/tasks", auth, async (req,res) => {
    //refactor with async/await
    const match = {}
    const sort = {}

    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1:1
    }

    try {
        const task = await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        })
        console.log(task)
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send(e)
    }
})

// Find a task by id
router.get("/tasks/:id", auth, async (req,res) => {
    const _id = req.params.id
    
    //refactor with async/await
    try{
        // const task = await Task.findById(_id)
        const task = await Task.findOne({_id, owner: req.user._id})
        if(!task){
            return res.status(404).send()
        }
        
        res.status(201).send(task)
        console.log('Found a result')
    }catch(e){
        res.status(500).send(e.message)
    }
})

// Update a task by id
router.patch("/tasks/:id", auth, async (req,res) => {
    const id = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({error : 'Invalid updates!'})
    }

    try {
        // const task = await Task.findByIdAndUpdate(id, req.body, { new: true , runValidator: true})
        // const task = await Task.findById(req.params.id)
        
        const task = await Task.findOne({_id: id, owner: req.user._id})
        
        if(!task){
            return res.status(404).send(),
            console.log("Can't find any task with this id")
        }

        updates.forEach((update) => {task[update] = req.body[update]})
        await task.save()
        res.status(200).send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

// Delete a task by id
router.delete('/tasks/:id', auth, async (req,res) => {
    try {
        const id = req.params.id
        const task = await Task.findOneAndDelete({_id: id, owner: req.user._id})
        if(!task){
            return res.status(404).send('Not found this task'),
            console.log('Not found this task')
        }
        res.status(200).send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router