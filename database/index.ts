import mongoose from 'mongoose'

// import mongoose, { Mongoose } from 'mongoose'
// export let db: Mongoose | undefined = undefined

// const connectDB = async () => {
//   try {
//     // const connectionInstance = await mongoose.connect(
//     //   `${process.env.MONGODB_URI}/${DB_NAME}`
//     // );
//     const connectionInstance = await mongoose.connect('mongodb://localhost:27017/wazemi')
//     db = connectionInstance
//     console.log(
//       `\n[ 🟢 MongoDB Connected ] - Database host : ${connectionInstance.connection.host}\n`
//     )
//   } catch (error) {
//     console.log('MongoDB connection error: ', error)
//     process.exit(1)
//   }
// }

// export default connectDB

export let mongodb: mongoose.Connection | undefined = undefined

/**
 * Creating New MongoDb Connection obect by Switching DB
 */
const getTenantDB = (tenantId: string, modelName: string, schema: mongoose.Schema) => {
  const dbName = tenantId === 'landlord' ? 'landlord' : `tenant_${tenantId}`
  if (mongodb) {
    // useDb will return new connection
    const db = mongodb.useDb(dbName, { useCache: true })
    // console.log(`⚙ Database switched to ${dbName}`)
    db.model(modelName, schema)
    return db
  }
  // return throwError(500, codes.CODE_8004);
  throw new Error(
    '\n[ 🔴 Mongoose connection error ] : ${err} with connection info {JSON.stringify(process.env.MONGODB_URL)}\n'
  )
}

/**
 * Return Model as per tenant
 */
export const getModelByTenant = (tenantId: string, modelName: string, schema: mongoose.Schema) => {
  // console.log(`getModelByTenant tenantId : ${tenantId}.`);
  const tenantDb = getTenantDB(tenantId, modelName.toLocaleLowerCase(), schema)
  return tenantDb.model(modelName.toLocaleLowerCase())
}

const connect = () => mongoose.createConnection('mongodb://localhost:27017')
const connectToMongoDB = () => {
  const db = connect()
  db.on('open', () => {
    console.log(
      `\n[ 🟢 MongoDB Connected ] Mongoose connection open to ${JSON.stringify(db.host)}\n`
    )
  })
  db.on('error', (err) => {
    console.log(
      `\n[ 🔴 Mongoose connection error ] : ${err} with connection info {JSON.stringify(process.env.MONGODB_URL)}\n`
    )
    process.exit(0)
  })
  mongodb = db
}

export default connectToMongoDB
