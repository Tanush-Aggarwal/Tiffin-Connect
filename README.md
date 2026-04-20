# TiffinConnect

## 📖 Problem Statement
Many individuals, students, and working professionals struggle to find healthy, affordable, and home-cooked meals on a daily basis. At the same time, talented home-kitchen providers often lack a centralized platform to connect with local customers and manage tiffin (meal) subscriptions efficiently. TiffinConnect bridges this gap by providing a specialized marketplace that connects customers seeking home-cooked meals with local tiffin providers. It streamlines discovery, subscription management, and order tracking to ensure a seamless experience for both parties.

## ✨ Features
- **Role-Based Dashboards**: Dedicated experiences for Customers and Providers.
- **Provider Marketplace**: Browse nearby home-kitchens by cuisine, ratings, and meal options.
- **Subscription Management**: Customers can easily initiate subscription requests (e.g., weekly/monthly), whilst providers can review, approve, or reject them.
- **Real-Time Notifications**: Role-aware alert system informing users of subscription status changes, new requests, and updates.
- **Warm & Engaging UI**: A home-kitchen-inspired interface with responsive design and modern components.
- **Secure Authentication**: Robust user login and sign-up flows.

## 💻 Tech Stack
- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS v4 for utility-first responsive styling
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Backend / BaaS**: Firebase (Authentication & Database)
- **Toasts & Alerts**: React Hot Toast

## 🚀 Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd tiffinconnect
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to the local URL (usually `http://localhost:5173`) to view the application.

## 🎥 Demo Video (Mandatory)
*(Add a link to the 3-5 minute demo video explaining the problem, features, and tech decisions here)*

## 🌐 Live Deployment
*(Add a link to your deployed Vercel / Netlify application here)*
