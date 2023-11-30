const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
require('dotenv').config()

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.no3nfin.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const classCollection = client.db('classDB').collection('classes')
    const userCollection = client.db('classDB').collection('users')
    const requestCollection = client.db('classDB').collection('requests')
    // user related api

    app.get('/users', async(req,res)=>{
        const result = await userCollection.find().toArray()
        res.send(result)
    })
    app.get('/users/:email',async(req,res)=>{
        const email = req.params.email
        const result = await userCollection.findOne({email})
        res.send(result)
    })
    app.post('/users',async(req,res)=>{
        const user = req.body;
        const query = {email : user?.email}
        const existingUser = await userCollection.findOne(query)
        if(existingUser){
            return res.send({message : 'user already exist', insertedId : null})
        }
        const result = await userCollection.insertOne(user)
        res.send(result)
    })
    app.patch('/users/admin/:id', async(req,res)=>{
        const id = req.params.id
        const filter = { _id : new ObjectId(id)}
        const updatedDoc ={
            $set : {
                role: 'admin'
            }
        }
        const result = await userCollection.updateOne(filter,updatedDoc)
        res.send(result)
    })


    // class related api
    app.get('/classes', async(req,res)=>{
        const result = await classCollection.find().toArray()
        res.send(result)
    })
    app.get('/classes/:id', async(req,res) => {
        const id = req.params.id
        const query = { _id : new ObjectId(id)}
        const result = await classCollection.findOne(query)
        res.send(result)
    })
    
    app.post('/classes',async(req,res)=>{
        const newClass = req.body;
        const result = await classCollection.insertOne(newClass)
        res.send(result)
    })
    app.patch('/updateclass/:id', async(req,res)=>{
        const updateClass = req.body
        const id = req.params.id
        const filter = { _id : new ObjectId(id)}
        const updatedDoc = {
            $set : {
                name : updateClass.name,
                title : updateClass.title,
                email : updateClass.email,
                price : updateClass.price,
                description : updateClass.description,
                image : updateClass.image
            }
        }
        const result =await classCollection.updateOne(filter, updatedDoc)
        res.send(result)
    })

    app.put('/approveClass/:id', async(req,res)=>{
        const id = req.params.id
        const filter = { _id : new ObjectId(id)}
        const updatedDoc = {
            $set : {
                status : "accepted"
            }
        }
        const result =await classCollection.updateOne(filter, updatedDoc)
        res.send(result)
    })
    app.put('/rejectClass/:id', async(req,res)=>{
        const id = req.params.id
        const filter = { _id : new ObjectId(id)}
        const updatedDoc = {
            $set : {
                status : "rejected"
            }
        }
        const result =await classCollection.updateOne(filter, updatedDoc)
        res.send(result)
    })
    app.delete('/classes/:id', async(req,res)=>{
        const id = req.params.id
        const query = { _id : new ObjectId(id)}
        const result = await classCollection.deleteOne(query)
        res.send(result) 
    })
    // teacher request api
    app.get('/requests', async(req,res)=>{
        const result = await requestCollection.find().toArray()
        res.send(result)
    })
    app.post('/requests',async(req,res)=>{
        const newRequest = req.body;
        const result = await requestCollection.insertOne(newRequest)
        res.send(result)
    })
   
    
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/' , (req,res)=>{
    res.send("final-effort is running")
})
app.listen(port, ()=>{
    console.log(`final-effort is running on port ${port}`)
})