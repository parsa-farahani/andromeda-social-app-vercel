import mongoose from "mongoose";


type MongooseCache = {
   conn: typeof mongoose | null;
   promise: Promise<typeof mongoose> | null;
};

const globalWithMongoose = globalThis as typeof globalThis & {
   mongooseCache?: MongooseCache;
};


const cached: MongooseCache = (globalWithMongoose.mongooseCache ??= {
   conn: null,
   promise: null,
});


const connectToDB = async () => {

   const storage = process.env.STORAGE_DRIVER ?? "local";

   const uri =  (storage === 'vercel')
      ? process.env.MONGODB_URL
      : process.env.MONGODB_URL_LOCAL

   if (!uri) {
      throw new Error("MONGODB_URL is not defined");
   }

   if (storage === 'vercel') {

      // We have a cached-connection -> return that
      if (cached.conn) return cached.conn;
   
   
      // We dont have any cached-connection yet
      // also we dont have a 'promise'
      // so establish a cnnection and put that in 'promise' field
      // so we cached the connection-promise also  ->  this avoids un-neccessary
      // DB requests (when we have an active promise, we dont establish connection again) 
      if (!cached.promise) {
   
         // bufferCommands: false  ->  it means that, if the connection is not created
         // give error instantly, instead of waiting silently
         cached.promise = mongoose.connect(uri, { bufferCommands: false });
      }
   
      // we have an active 'promise' in cache -> await the promise and put that
      // in cached-conn
      try {
   
         cached.conn = await cached.promise;
   
         console.log(`✅ Connected To DB Successfully.`);
         
   
      } catch (error) {
   
         cached.promise = null;
         
         console.log(`❌ Error DB Connection`, error);
   
         throw error;
      }
   }
   else {

      try {

         if (mongoose.connections[0].readyState !== 0) {
            return true;
         }

         await mongoose.connect( uri );

         console.log(`✅ Connected To DB Successfully.`);
         
      } catch (error) {
         
         console.log(`❌ Error DB Connection - ${(error instanceof Error) ? (error?.message ?? error.toString()) : "Unknown Error"}`);
      }
   }
}


export default connectToDB;