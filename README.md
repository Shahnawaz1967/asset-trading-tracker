"Asset Trading Tracker" is a simple tool that helps manage and trade digital assets. It includes basic features like user login, managing assets, and trading them in a marketplace.
The project is built with Node.js and Express for the backend, MongoDB as the database, and JWT for handling user authentication. The code is organized using the MVC pattern, which keeps everything clean and well-structured.
 I Implemented secure user authentication using JWT. During signup, user credentials are securely stored in the database after hashing the passwords. The login route generates a JWT token, which is used to authenticate users on protected routes.
The asset management system lets users create and update assets. Each asset can be saved as a draft or published to be visible on the marketplace. The asset's details, like name, description, and image, are stored in MongoDB.
The marketplace lists all published assets. Users can request to buy assets, negotiate prices, and accept or deny purchase requests. This process is secure, ensuring that only logged-in users can make trades.
The MongoDB connection is handled in a separate config file, keeping the code modular and easy to maintain. Environment variables are used to securely store the database URI and JWT secret.
I chose Zod for schema validation because it's simple and works well with Javascript and TypeScript. Zod has a straightforward API for defining schemas and automatically creates TypeScript types from them. This helps keep the code type-safe and easy to maintain.
When I was making this i faced challenges which are as 
 Handling Authentication - challenge was managing JWT tokens securely across sessions. This was solved by adding middleware that checks the token on every protected route, so only authenticated users can access certain features.
Database connection Issue- Initially there were connection issues with MongoDB because of incorrect environment variable settings. This was fixed by carefully checking the environment setup and making sure the connection string was loaded correctly.
Throughout the project, the code followed SOLID principles and the DRY principle. The MVC pattern was used to keep the code clean and organized, making it easier to maintain and expand.
This project was a great learning experience. It helped me improve my skills in secure authentication, database management, and handling complex business logic. I gained valuable insights into creating scalable and easy-to-maintain applications.
# To run this project 
1)clone the repository
2)npm i  
3)npm run start
