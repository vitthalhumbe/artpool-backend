# ArtPool (Backend)

Welcome to back side of ArtPool! This is server-side logic build with Node.js and Express.js. It handles : securing users, storing the artworks in Valut (MongoDB), and managing interactive real-time working of website.

# Small Details

- **Auth** : Secure signup and login using JWT (JSON Web Tokens). It automatically detects whether you are artist or customer.

- **Valut** : Stores artwork ddata including titles, prices, decriptions, array of images URLs.

- **Profile Management** : Handles profile updates (Avatars, Banners, bios) so users can build their BRAND.

- **Live Stats** : I managed to track Views and Likes efficiently. It ensures a user can only like a post once.


# Tech Stack

- **Runtime** : Node.js
- **Framework** : Express.js
- **Database** : MongoDB 
- **ODM** : Mongoose (Object-Document Mapper)
- **Security** : bcryptjs (for password hashing)  + jsonwebtoken (Auth)
- **Utilities** : cors (Cross-origin resource Sharing)


# Little Description about API

Authentication 
- `POST /api/auth/register` - create new user
- `POST /api/auth/login` - Get your JWT token
- `PUT /api/auth/update-profile` - update bio, avatar, banner, etc.

Artworks 
- `GET /api/artworks/user/:userId` - fetch an artist's portfolio
- `POST /api/artworks` - Upload new art
- `POST /api/artworks/:id/view` - Increment view count
- `POST /api/artworks/:id/like` - Toggle like status
- `DELETE /api/artworks/:id` - Remove an artwork

(Currently there are only two, as review and commision functions are not built yet.)

# How to Run it ?

note : you need `Node.js` and a running `MongoDB` instance (local or Atlas).

1. Clone the repo:
```bash
git clone https://github.com/vitthalhumbe/artpool-backend.git
cd artpool-backend
```

2. Install the dependencies:
```bash
npm install
```

3. Setup the Environment 

Create a `.env` file in the root folder. you need these secrets to make it work. 

```bash
PORT=5000
MONGODB_URI=mongodb+srv://your-mongo-connection-string
JWT_SECRET=your-super-long-secret-key-for-JWT
```

4. Run :
```bash
npm run dev
```

You should see `Server running on port 5000` and `MongoDB connected`



# current status
- Done : User & Auth System
- Done : Profile Logic
- Done : Artwork CRUD
- Pending : Search & Filter
- Pending : Commision Logic