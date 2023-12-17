const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sdbndcb.mongodb.net/?retryWrites=true&w=majority`;

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
        const userCollection = client.db('jobUserDB').collection('users');
        const loggedUserCollection = client.db('jobUserDB').collection('loggedUsers');

        app.get('/users', async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result);
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already exist', insertedId: null })
            };

            const result = await userCollection.insertOne(user);
            res.send(result);
        })

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await userCollection.deleteOne(query);
            res.send(result);
        })

        // logged-users api
        app.post('/logged-users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await loggedUserCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already exist', insertedId: null })
            };

            const result = await loggedUserCollection.insertOne(user);
            res.send(result);
        });

        app.get('/logged-users', async (req, res) => {
            const result = await loggedUserCollection.find().toArray();
            res.send(result);
        })


        app.get('/logged-users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const result = await loggedUserCollection.findOne(query);
            res.send(result);
        })

        // app.patch('/logged-users/:email', async (req, res) => {
        //     const email = req.params.email;
        //     const filter = { email };
        //     const updatedDoc = {
        //         $set: {
        //             action: 'fired'
        //         }
        //     }
        //     const result = await userCollection.updateOne(filter, updatedDoc);
        //     res.send(result);
        // })

        app.patch('/logged-users/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email }
            const updatedInfo= req.body;
            const product = {
                $set: {
                    name: updatedInfo.name,
                    email: updatedInfo.email,
                    phone: updatedInfo.phone,
                    gender: updatedInfo.gender,
                    source: updatedInfo.source,
                    city: updatedInfo.city,
                    state: updatedInfo.state,
                }
            }
            const result = await loggedUserCollection.updateOne(filter, product);
            res.send(result);
        })


        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('server is running');
})

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
})