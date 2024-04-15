# Multi-tenancy with AdonisJS + MongoDB

Multi tenancy for SaaS can be achieved with those tech using :

- AdonisJS route groups
- AdonisJS Dynamic Subdomains routing functionality for custom tenant urls. (ex: apple.yoursaas.app, blackrock.yoursaas.app). Assuming your DNS got a wild card on it for subdomains (\*.yoursaas.app). For testing, set a "host" header in your http client requests.
- AdonisJS route middleware to check tenant existence upon requests against the dynamic subdomain routes.
- Mongoose (MongoDB ODM) to handle connection to a MongoDB cluster using
  Mongoose.Prototype.createConnection('...') method.
- Mongoose.Connection.Prototype.useDb(dbName, {useCache: true}) helper to switch database connection programmatically with caching enabled (for connection deduplication)
- Using dynamic Mongoose.Model setup and Mongoose.Schema

This is a demo project.
