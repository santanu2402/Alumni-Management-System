import mongoose from 'mongoose'

const connectDB = (url) => {
    const connectionParams = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }

    mongoose.connect(url, connectionParams).then(() => console.log('MongoDB Connected')).catch((err) => { console.log(err) });
}

export default connectDB;