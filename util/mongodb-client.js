const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://sandeep24:4H7fJUMNTTkfVzoz@logins.qb2cq.mongodb.net/?retryWrites=true&w=majority&appName=logins";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function createLogin(emailIn, passwordIn) {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        const db = client.db();
        const collection = await db.collection("logins");
        const loginData = {
            email: emailIn,  // Event name
            password: passwordIn,  // Date of the event
        };

        // Insert the ticket document into the collection
        const result = await collection.insertOne(loginData);
        console.log("result: ${result.insertedId}");
        return true
    } catch (error) {
        console.error('Error during login:', error);
        return false;
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

async function checkLogin(email, password) {
    try {
        // Connect to MongoDB
        await client.connect();
        const db = client.db();
        const collection = db.collection("logins");

        // Search for a matching login document
        const user = await collection.findOne({ email, password });

        if (user) {
            console.log(`Login successful! Welcome, ${user.email}.`);
            return { success: true, userID: user._id };
        } else {
            console.log('Invalid email or password.');
            return { success: false, userID: null };
        }
    } catch (error) {
        console.error('Error during login:', error);
        return false;
    } finally {
        // Close the MongoDB connection
        await client.close();
    }
}

async function checkIdExists(id) {
    try {
        // Connect to the MongoDB server
        await client.connect();
        const db = client.db(); // Use the default database, or specify one
        const collection = db.collection("logins");

        // Check if the document with the specified _id exists
        const document = await collection.findOne({ _id: new ObjectId(id) });

        if (document) {
            console.log(`Document with _id ${id} exists.`);
            return true; // Document found
        } else {
            console.log(`Document with _id ${id} does not exist.`);
            return false; // Document not found
        }
    } catch (error) {
        console.error('Error checking _id existence:', error);
        return false; // Return false in case of error
    } finally {
        // Close the connection
        await client.close();
    }
}

async function uploadClothes(req, res) {
    try {
        // Connect to MongoDB
        await client.connect();
        const db = client.db(); // Replace with your database name
        const collection = db.collection('clothes'); // Replace with your collection name
        const userId = req.body.userId;

        // Store shirts
        if (req.files['shirts[]']) {
            const shirtItems = req.files['shirts[]'].map(file => ({
                name: file.originalname,
                image: file.buffer,
                userID: new ObjectId(userId),
                type: 'shirt',
            }));
            await collection.insertMany(shirtItems);
        }

        // Store pants
        if (req.files['pants[]']) {
            const pantItems = req.files['pants[]'].map(file => ({
                name: file.originalname,
                image: file.buffer,
                userID: new ObjectId(userId),
                type: 'pant',
            }));
            await collection.insertMany(pantItems);
        }

        res.json({ message: 'Images uploaded successfully!' });
    } catch (error) {
        console.error('Error uploading images:', error);
        res.status(500).json({ message: 'Error uploading images' });
    } finally {
        await client.close(); // Ensure the client closes
    }
}

async function getClothesTypeByUserId(userId, typeString) {
    try {
        await client.connect(); // Connect to the database
        const database = client.db(); // Replace with your database name
        const collection = database.collection('clothes'); // Replace with your collection name

        // Find all shirts associated with the given user ID
        const clothes = await collection.find({ userID: new ObjectId(userId), type: typeString }).toArray();
        

        // Convert each shirt's image data to Base64
        const clothesWithBase64Images = clothes.map(cloth => {
            const base64Image = cloth.image ? cloth.image.toString('base64') : null; // Convert Buffer to Base64
            return {
                ...cloth,
                base64Image: base64Image ? `data:image/jpeg;base64,${base64Image}` : null // Create Data URL
            };
        });
        

        return clothesWithBase64Images; // Return the shirts with Base64 images
    } catch (error) {
        console.error('Error retrieving clothes:', error);
        throw error; // Rethrow the error for further handling
    } finally {
        await client.close(); // Ensure the client is closed after the operation
    }
}

// checkLogin("sunny.bajamahal@gmail.com", "bruh");
module.exports = { createLogin, checkLogin, checkIdExists, uploadClothes, getClothesTypeByUserId };
