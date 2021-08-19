const path = require('path');

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const {v4: uuidv4} = require('uuid');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4() + file.originalname)
    }
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

//for parsing json
app.use(express.json());
//For updloading image in server
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')))

app.use((req, res, next) => {
    //Instead of '*' you can put any site that you want to have allow to access to youre server
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((err, req, res, next) => {
    console.log(err);
    const status = err.statusCode || 500;
    const message = err.message;
    const data = err.data;
    res.status(status).json({message: message, data: data});
})

const uri = "mongodb+srv://javadkia:2213744829@clusterjk.rd49d.mongodb.net/messages?retryWrites=true&w=majority";
mongoose.connect(uri, {
    useUnifiedTopology: true
}).then(result => {
        const server = app.listen(8080, () => console.log('server is running'));
        //Set up socket io for webSocket
        const io = require('./socket').init(server);

        io.on('connection', socket => {
            console.log('client connected')
        });
    }).catch(err => console.log(err));