# BusinessStatistics-2 Simulator

An interactive learning simulator for Business Statistics II with comprehensive authentication and modern UI.

## 🚀 Features

### Authentication System
- **Firebase Authentication** - Secure email/password and Google sign-in
- **Login Page** - Clean, modern login interface with validation
- **Forgot Password** - Professional password reset with email integration
- **User Management** - Real-time authentication state management
- **Error Handling** - Comprehensive error messages for all scenarios

### Statistical Modules
- **Regression Analysis** - Linear regression, correlation coefficients, and predictive modeling
- **Index Numbers** - Price indices, quantity indices, and consistency tests
- **Time Series Analysis** - Trend analysis, seasonal decomposition, and forecasting
- **Probability** - Basic probability concepts, permutations, combinations, and Bayes' theorem
- **Theoretical Distributions** - Binomial, Poisson, and Normal distributions

### User Experience
- **Responsive Design** - Works perfectly on desktop and mobile devices
- **Modern UI** - Clean, professional interface with Tailwind CSS
- **Loading States** - Smooth loading animations and feedback
- **Interactive Learning** - Step-by-step calculations and visualizations
- **Multi-language Support** - Video tutorials in English, Hindi, and Telugu

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Charts**: Recharts
- **Math Rendering**: KaTeX

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/BcomBuddy/BusinessStatistics-2.git
cd BusinessStatistics-2
```

2. Install dependencies:
```bash
cd project
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🔐 Authentication Setup

The application uses Firebase Authentication. To set up your own Firebase project:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and add Email/Password and Google sign-in providers
3. Update the Firebase configuration in `src/config/firebase.ts`
4. Configure your domain in Firebase Authentication settings

## 📱 Usage

### Login
- **Email/Password**: Use any valid email and password combination
- **Google Sign-in**: Click "Sign in with Google" for OAuth authentication
- **Forgot Password**: Click "Forgot Password?" to reset your password via email

### Learning Modules
1. **Select a Module** - Choose from the available statistical modules
2. **Learn Theory** - Study concepts with clear explanations
3. **Practice** - Test your knowledge with interactive questions
4. **Simulate** - Use calculators and visualizations with your data

## 🎯 Key Features Implemented

### Authentication
- ✅ Firebase email/password authentication
- ✅ Google OAuth integration
- ✅ Password reset functionality
- ✅ Real-time authentication state
- ✅ Secure logout functionality
- ✅ Comprehensive error handling

### UI/UX
- ✅ Modern, responsive design
- ✅ Loading states and animations
- ✅ Professional error messages
- ✅ Clean modal interfaces
- ✅ Mobile-friendly layout

### Security
- ✅ Firebase security rules
- ✅ Input validation
- ✅ Rate limiting protection
- ✅ Secure password reset flow

## 📁 Project Structure

```
project/
├── src/
│   ├── components/
│   │   ├── Login.tsx                 # Login page with Firebase auth
│   │   ├── ForgotPasswordModal.tsx   # Password reset modal
│   │   ├── Topbar.tsx               # Navigation bar with logout
│   │   └── ...
│   ├── config/
│   │   └── firebase.ts              # Firebase configuration
│   ├── services/
│   │   └── authService.ts           # Authentication service
│   ├── modules/                     # Statistical learning modules
│   └── utils/                       # Utility functions
├── public/
└── package.json
```

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Structure
- **Components**: Reusable UI components
- **Services**: Business logic and API calls
- **Modules**: Statistical learning content
- **Utils**: Helper functions and utilities

## 📧 Support

For support or questions, please contact:
- **Email**: b.combuddy007@gmail.com
- **GitHub**: [@BcomBuddy](https://github.com/BcomBuddy)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Firebase for authentication services
- React and TypeScript communities
- Tailwind CSS for styling framework
- All contributors and users

---

**BusinessStatistics-2 Simulator** - Making statistical learning interactive and accessible! 📊✨
