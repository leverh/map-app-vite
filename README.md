# 📍 PinPoint

**Your personal map journal for discovering and remembering amazing places.**

PinPoint is a modern, responsive web application that allows users to create, organize, and manage location pins on an interactive map. Built with React and Firebase, it offers a the user the option to catalog their favorite places with custom categories, ratings, and personal notes.

![PinPoint Screenshot](/public/images/project-screenshot.png)

## ✨ Features

### 🗺️ **Interactive Mapping**
- CartoDB map tiles with light/dark theme support
- Pan and zoom interactions
- Smart marker clustering for dense areas
- Real-time location search with autocomplete

### 📍 **Pin Management**
- 13 custom categories (Food, Café, Parks, Museums, etc.)
- 5-star rating system for saved places
- Personal notes and memories for each location
- Easy pin creation with a modal interface

### 🎨 **Design**
- Responsive design that works on all devices
- Automatic light/dark theme with system preference detection
- Glassmorphism effects and smooth micro-animations
- Accessible interface with keyboard navigation

### 📊 **Analytics & Insights**
- Personal statistics dashboard
- Category-based filtering and organization
- Visual data representations
- Pin distribution analytics

### 🔐 **Secure Authentication**
- Email/password authentication
- Google OAuth integration
- Secure user profile management
- Real-time data synchronization

## 🚀 Live Demo

[**View Live Demo**](https://serene-florentine-4eaae2.netlify.app/)

## 🛠️ Built With

- **Frontend:** React 19 + Vite
- **Mapping:** React Leaflet with CartoDB tiles
- **Styling:** CSS Modules design system
- **Authentication:** Firebase Auth with Google OAuth
- **Database:** Firebase Realtime Database
- **Icons:** Custom SVG icon set
- **Deployment:** Firebase Hosting

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm
- Firebase project with Authentication and Realtime Database enabled

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/leverh/map-app-vite
   cd map-app-vite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Configuration**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password and Google)
   - Enable Realtime Database
   - Update `src/firebaseConfig.js` with your Firebase config

4. **Add Category Icons**
   - Add 13 SVG icons to `/public/icons/` directory (I used [Lucide](https://lucide.dev/)):
   - `default.svg`, `food.svg`, `cinema.svg`, `education.svg`, `cafe.svg`, `hotel.svg`, `park.svg`, `museum.svg`, `religion.svg`, `shopping.svg`, `sport.svg`, `transport.svg`, `health.svg`

5. **Set Database Rules**
   ```json
   {
     "rules": {
       "users": {
         "$uid": {
           ".read": "$uid === auth.uid",
           ".write": "$uid === auth.uid"
         }
       }
     }
   }
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

7. **Build for Production**
   ```bash
   npm run build
   ```

## 🏗️ Project Structure

```
pinpoint/
├── public/
│   └── icons/           # Category SVG icons (13 files)
├── src/
│   ├── components/      # React components
│   ├── services/        # Firebase services
│   ├── styles/          # Global CSS and theme system
│   ├── App.jsx          # Main app component
│   └── firebaseConfig.js
├── package.json
└── README.md
```

## 🎯 Key Components

- **MapComponent** - Interactive map with pin management
- **CategorySelector** - Category selection and filtering
- **PinModal** - Pin creation with ratings and notes
- **StatsPanel** - Analytics and insights dashboard
- **Navbar** - Responsive navigation with theme toggle
- **Authentication** - Sign-in/sign-up flow

## Customization
- **Categories:** Modify the categories object in `CategorySelector.jsx`
- **Map Tiles:** Change tile URL in `MapComponent.jsx`
- **Theme Colors:** Update CSS variables in `styles/global.css`

## 🧪 Testing

The application includes error handling and loading states. For manual testing:

1. **Authentication Flow** - Test sign up, sign in, and Google OAuth
2. **Pin Management** - Create, edit, and delete pins
3. **Responsive Design** - Test on various screen sizes
4. **Theme Switching** - Verify light/dark mode functionality
5. **Data Persistence** - Ensure data saves and loads correctly

## 📄 License

This project is licensed under the MIT License. Copy or share - I really don't care 🖖✌️

## 👨‍💻 Creator

- Portfolio: [PixelSummit](https://pixelsummit.dev/)

## 🙏 Credits

- [React Leaflet](https://react-leaflet.js.org/) mapping components
- [CartoDB](https://carto.com/) map tiles
- [Firebase](https://firebase.google.com/) backend services
- [Lucide](https://lucide.dev/) icons

---

**⭐ Star this repository if you found it helpful!**