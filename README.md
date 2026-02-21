# CDS Progress Tracker

A specialized, premium web application designed for Combined Defence Services (CDS) aspirants to track daily practice sessions, monitor performance metrics, and systematically improve through spaced-repetition mistake tracking.

## 🌟 Key Features

- **Daily Practice Logging**  
  Easily log practice sessions. Automatically calculates your final score based on the official CDS marking scheme (+1 for correct, -0.33 for incorrect) and tracks your overall accuracy and attempt rate. Includes an Edit functionality to update logged data seamlessly.

- **Mistake Revision Tracker (Spaced Repetition)**  
  Questions marked as "Wrong" are automatically added to the centralized Mistake Revision queue. A smart interval system prompts you to review these exact topics in the future.
  - *Mastery System:* Successfully review a topic 3 times to mark it as "Mastered".
  - *Dynamic Intervals:* Reattempting an unmastered question reschedules it for future review.

- **Advanced Data Visualizations**  
  Rich dashboard insights powered by **Chart.js**:
  - **Skill Web (Radar Chart):** Quickly identify your strength distribution across Maths, English, and General Studies.
  - **Performance Trends (Line Chart):** Track your accuracy trajectory over your last 10 practice sessions.
  - **Error Patterns (Doughnut Chart):** Visual breakdown of why mistakes happen (Concept gaps vs. Careless errors).

- **Modern & Responsive UI/UX**  
  A sleek dark-mode-first aesthetic utilizing glassmorphism, animated transitions, and fluid components. Fully responsive to work perfectly on mobile devices.

- **Offline / Online Capabilities**  
  Built with Firebase for secure, real-time data synchronization across devices, with robust fallbacks.

## 🛠️ Technology Stack

- **Core:** HTML5, CSS3 (Vanilla), JavaScript (ESModules)
- **Visuals:** [Chart.js](https://www.chartjs.org/) for rendering responsive charts, [Lucide](https://lucide.dev/) for premium iconography
- **Tooling:** [Vite](https://vitejs.dev/) for lightning-fast bundling and development
- **Backend & Database:** Google Firebase (Authentication, Firestore Database, Hosting)

## 🚀 Getting Started

### Prerequisites
- Node.js installed on your machine.
- A Firebase project setup with Firestore and Authentication (Email/Password & Google) enabled.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Vpcodes11/cdstracker.git
   cd cdstracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory based on the provided `.env.example` and add your Firebase configuration keys:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   ...
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` to view the application.

## 📦 Deployment

The application is configured for deployment on Firebase Hosting.
1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Deploy the application:
   ```bash
   npx firebase deploy --only hosting
   ```
