# Portfolio CMS MEAN Application

A dynamic personal portfolio website that allows users to update their resume, upload project details, and manage a blog using an admin panel.

## Features

- **Two-role system**: Admin and Portfolio owners
- **Resume Management**: PDF upload with automatic image conversion for display
- **Project Management**: Upload and manage project details with Cloudinary integration
- **Blog Management**: Create and manage blog posts
- **Unique Portfolio URLs**: Each user gets a personalized portfolio link
- **Responsive Design**: Mobile-friendly interface
- **Admin Panel**: Manage all users and content

## Tech Stack

- **Frontend**: AngularJS 1.x, Bootstrap, HTML5, CSS3
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **File Storage**: Cloudinary for images and file conversions
- **Authentication**: JWT tokens
- **PDF Processing**: PDF to Image conversion

## Project Structure

```
portfolio-cms/
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── utils/
├── client/
│   ├── app/
│   │   ├── components/
│   │   ├── services/
│   │   ├── controllers/
│   │   └── views/
│   ├── assets/
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   └── index.html
├── uploads/
└── public/
```

## Installation

1. Clone the repository
2. Install server dependencies: `npm run install-server`
3. Install client dependencies: `npm run install-client`
4. Set up environment variables (see .env.example)
5. Start MongoDB service
6. Run the application: `npm run dev`

## Environment Variables

Create a `.env` file in the root directory:

```
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/portfolio-cms
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Usage

1. **Admin**: Access admin panel to manage users and content
2. **Users**: Register, upload resume, add projects and blog posts
3. **Portfolio**: Each user gets a unique URL: `/portfolio/:username`

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/portfolio/:username` - Get user portfolio
- `POST /api/resume/upload` - Upload resume
- `GET /api/projects` - Get projects
- `POST /api/projects` - Create project
- `GET /api/blogs` - Get blog posts
- `POST /api/blogs` - Create blog post

## License

MIT