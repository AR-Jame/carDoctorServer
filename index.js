const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connection URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.r9h20.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        await client.connect();
        const servicesCollection = client.db("carDoctor").collection("services");
        const bookingCollection = client.db("carDoctor").collection("bookings");
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find();
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const options = {
                projection: { title: 1, service_id: 1, price: 1, img: 1 },
            }
            const result = await servicesCollection.findOne(query, options);
            res.send(result)
        })

        // bookings
        app.post('/bookings', async (req, res) => {
            const body = req.body;
            console.log(body)
            const result = await bookingCollection.insertOne(body);
            res.send(result)
        })
        
        app.get('/bookings', async (req, res) => {
            let quary = {};
            const reqQuary = req.query.email;
            if (reqQuary) {
                quary = { email: reqQuary };
            }
            const result = await bookingCollection.find(quary).toArray();
            res.send(result);
        })

        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result  = await bookingCollection.deleteOne(query);
            res.send(result);
        })

        app.patch('/bookings/:id', async(req, res) => {
            const id = req.params.id;
            const body = req.body;
            console.log(body)
            const filter = { _id: new ObjectId(req.params.id) };
            const updateDoc = {
                $set: {
                    status: body.status,
                }
            }
            const result = await  bookingCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('alhamdulillah, my port is running');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});