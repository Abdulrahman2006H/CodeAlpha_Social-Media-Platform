# Connectly - Mini Social Media Platform

Connectly is a full-stack mini social media platform built with Angular and ASP.NET Core Web API. The project allows users to create accounts, share posts, upload images, like and comment on posts, follow other users, and manage their personal profile.

---

## Features

- User registration and login
- User profile page
- Create, edit, and delete posts
- Upload images with posts
- Like posts
- Add comments to posts
- Follow and unfollow users
- Suggested users section
- Responsive dashboard UI
- SQL Server database integration

---

## Tech Stack

### Frontend
- Angular
- TypeScript
- HTML
- CSS

### Backend
- ASP.NET Core Web API
- Entity Framework Core
- SQL Server

---

## Project Structure

```text
social-media-app/
│
├── SocialMedia.Api/
│   └── SocialMedia.Api/
│       ├── Controllers/
│       ├── Data/
│       ├── Models/
│       ├── Migrations/
│       ├── wwwroot/uploads/
│       ├── Program.cs
│       └── appsettings.json
│
└── socialmedia(Frontend)/
    ├── src/
    │   ├── app/
    │   │   ├── components/
    │   │   │   ├── dashboard/
    │   │   │   ├── login/
    │   │   │   ├── register/
    │   │   │   └── profile/
    │   │   └── services/
    │   │       ├── auth.service.ts
    │   │       ├── post.service.ts
    │   │       └── user.service.ts
    │   └── styles.css
    ├── angular.json
    └── package.json
```

---

## Database Tables

- Users
- Posts
- Comments
- Likes
- Follows

---

## API Endpoints

### Auth

```http
POST /api/auth/register
POST /api/auth/login
```

### Users

```http
GET /api/users
GET /api/users/{id}
POST /api/users/{followingId}/follow
```

### Posts

```http
GET /api/posts
POST /api/posts
PUT /api/posts/{id}
DELETE /api/posts/{id}
POST /api/posts/{postId}/like
POST /api/posts/{postId}/comments
```

---

## How to Run the Project

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_LINK_HERE
cd social-media-app
```

---

## Backend Setup

Go to the backend project folder:

```bash
cd SocialMedia.Api/SocialMedia.Api
```

Restore packages:

```bash
dotnet restore
```

Update the connection string in `appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=.;Database=SocialMediaDb;Trusted_Connection=True;TrustServerCertificate=True"
}
```

Run migrations:

```bash
dotnet ef database update
```

Start the backend server:

```bash
dotnet run
```

The API will run on a local URL like:

```text
http://localhost:5293
```

---

## Frontend Setup

Open another terminal and go to the frontend folder:

```bash
cd socialmedia(Frontend)
```

Install packages:

```bash
npm install
```

Run Angular:

```bash
ng serve
```

Open the frontend in the browser:

```text
http://localhost:4200
```

---

## Important Note

Make sure the API URL inside Angular services matches your backend port.

Example:

```ts
private apiUrl = 'http://localhost:5293/api/posts';
```

If your backend runs on a different port, update the services:

- `auth.service.ts`
- `post.service.ts`
- `user.service.ts`

---

## Screenshots

Add your project screenshots here:

```md
![Login Page](screenshots/login.png)
![Dashboard Page](screenshots/dashboard.png)
![Profile Page](screenshots/profile.png)
```

---

## What I Learned

Through this project, I practiced:

- Building a full-stack web application
- Connecting Angular with ASP.NET Core Web API
- Working with SQL Server and Entity Framework Core
- Creating RESTful API endpoints
- Handling image uploads
- Managing relationships between users, posts, comments, likes, and follows
- Improving frontend UI and user experience

---

## Author

**Abdulrahman Hossam**

GitHub: [https://github.com/Abdulrahman2006H]

---

## Repository Link

[https://github.com/Abdulrahman2006H/CodeAlpha_Social-Media-Platform]
