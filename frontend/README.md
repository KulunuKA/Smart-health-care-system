# Smart Healthcare System - Frontend

A comprehensive React-based frontend application for the Smart Healthcare System, designed to digitalize hospital management for urban healthcare facilities.

## 🚀 Features

### Core Modules
- **Appointment Management** - Book, reschedule, and manage patient appointments
- **Patient Record Management** - Digital health cards and comprehensive medical records
- **Payment & Billing** - Secure payment processing with digital receipts
- **Analytics & Reporting** - Healthcare analytics and reporting dashboard
- **Authentication & Digital Health Card** - Role-based access control
- **Notification System** - Real-time alerts and notifications
- **Admin & Staff Utilities** - Administrative control and system management

### Additional Pages
- **Home Page** - System overview and navigation
- **About Page** - Mission, vision, and project information
- **Contact Page** - Hospital contact form and information

## 🛠️ Tech Stack

- **Frontend Framework**: React 18+
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v6+
- **State Management**: Context API
- **Form Handling**: React Hook Form
- **Notifications**: React Toastify
- **PDF Export**: jsPDF / React-PDF
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint + Prettier

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-healthcare-system/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   Update the environment variables in `.env` file.

4. **Start development server**
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`.

## 🏗️ Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── assets/                 # Static assets
│   ├── components/             # Reusable components
│   │   ├── appointments/      # Appointment-specific components
│   │   ├── records/           # Patient record components
│   │   ├── payments/          # Payment components
│   │   ├── reports/           # Reporting components
│   │   ├── auth/              # Authentication components
│   │   ├── notifications/     # Notification components
│   │   ├── admin/             # Admin components
│   │   └── common/            # Shared components
│   ├── pages/                  # Page components
│   ├── services/              # API service functions
│   ├── utils/                 # Utility functions
│   ├── contexts/              # React contexts
│   ├── tests/                 # Test files
│   ├── App.js                 # Main app component
│   └── index.js               # Entry point
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## 🎨 Design System

### Color Palette
- **Primary**: #0ea5e9 (Sky Blue)
- **Secondary**: #14b8a6 (Teal)
- **Accent**: #1e293b (Slate)
- **Background**: #f9fafb (Light Gray)

### Typography
- **Font Family**: Inter, Poppins, system-ui, sans-serif
- **Responsive**: Mobile-first design approach

### Components
- **Buttons**: Rounded corners, gradient backgrounds, hover effects
- **Cards**: Shadow effects, hover animations
- **Forms**: Consistent styling with validation states
- **Navigation**: Role-based menu items

## 🔐 Authentication & Roles

### User Roles
- **Patient**: View appointments, medical records, make payments
- **Doctor**: Manage appointments, update patient records
- **Staff**: Assist with appointments and patient management
- **Admin**: Full system access and user management
- **Manager**: Access to reports and analytics

### Protected Routes
- Role-based access control
- Authentication state management
- Automatic redirects for unauthorized access

## 📱 Responsive Design

- **Mobile**: Single column layout, touch-friendly interface
- **Tablet**: Two-column layout with optimized spacing
- **Desktop**: Multi-column layout with full feature access

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Coverage
- **Target**: >80% coverage
- **Components**: Rendering, user interactions, form validation
- **Services**: API calls, error handling
- **Utils**: Helper functions and formatters

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
```env
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_ENVIRONMENT=production
```

## 📊 Performance

- **Code Splitting**: Lazy loading for route components
- **Optimization**: React.memo for expensive components
- **Bundle Size**: Optimized with tree shaking
- **Caching**: Service worker for offline functionality

## 🔧 Development

### Code Quality
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks
- **Conventional Commits**: Standardized commit messages

### Available Scripts
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint issues
npm run format     # Format code with Prettier
```

## 🌐 API Integration

### Backend Communication
- **Base URL**: Configurable via environment variables
- **Authentication**: JWT token-based
- **Error Handling**: Comprehensive error states
- **Loading States**: User-friendly loading indicators

### Service Layer
- **authService**: Authentication and user management
- **appointmentService**: Appointment operations
- **recordService**: Patient record management
- **paymentService**: Payment processing
- **reportService**: Analytics and reporting
- **notificationService**: Notification management

## 📈 Analytics & Monitoring

- **Web Vitals**: Performance monitoring
- **Error Tracking**: Comprehensive error logging
- **User Analytics**: Usage patterns and insights
- **System Health**: Real-time system monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- **Email**: support@smarthealthcare.com
- **Documentation**: [Link to documentation]
- **Issues**: [GitHub Issues](link-to-issues)

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
- **v1.1.0** - Added advanced reporting features
- **v1.2.0** - Enhanced mobile responsiveness
- **v1.3.0** - Improved performance and security

---

**Smart Healthcare System** - Digitalizing healthcare for a better tomorrow.