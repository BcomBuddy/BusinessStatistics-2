import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  BarChart3, 
  Activity, 
  Dice6, 
  Calculator, 
  BookOpen,
  ChevronDown
} from 'lucide-react';

const Home: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('english');

  const videoUrls = {
    english: 'https://www.youtube.com/embed/KmLj8YFJhow?rel=0&modestbranding=1',
    hindi: 'https://www.youtube.com/embed/xKqoxH36pI8?rel=0&modestbranding=1',
    telugu: 'https://www.youtube.com/embed/U2EoLCHR8AQ?rel=0&modestbranding=1'
  };

  const languageOptions = [
    { value: 'english', label: 'English' },
    { value: 'hindi', label: 'Hindi/Urdu' },
    { value: 'telugu', label: 'Telugu' }
  ];

  const modules = [
    {
      id: 'regression',
      title: 'Regression Analysis',
      description: 'Linear regression, correlation coefficients, and predictive modeling with step-by-step calculations.',
      icon: TrendingUp,
      features: ['Correlation Analysis', 'Regression Lines', 'Predictions', 'Property Verification']
    },
    {
      id: 'index-numbers',
      title: 'Index Numbers',
      description: 'Price indices, quantity indices, and consistency tests using various methods.',
      icon: BarChart3,
      features: ['Laspeyres & Paasche', 'Fisher Ideal', 'Consistency Tests', 'Base Shifting']
    },
    {
      id: 'time-series',
      title: 'Time Series Analysis',
      description: 'Trend analysis, seasonal decomposition, and forecasting methods.',
      icon: Activity,
      features: ['Moving Averages', 'Trend Analysis', 'Seasonal Indices', 'Forecasting']
    },
    {
      id: 'probability',
      title: 'Probability',
      description: 'Basic probability concepts, permutations, combinations, and Bayes\' theorem.',
      icon: Dice6,
      features: ['Permutations & Combinations', 'Conditional Probability', 'Bayes\' Theorem', 'Monte Carlo Simulation']
    },
    {
      id: 'distributions',
      title: 'Theoretical Distributions',
      description: 'Binomial, Poisson, and Normal distributions with fitting and analysis.',
      icon: Calculator,
      features: ['Binomial Distribution', 'Poisson Distribution', 'Normal Distribution', 'Distribution Fitting']
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* New Gradient Header Section */}
      <div className="relative overflow-hidden rounded-2xl mb-12">
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 p-12 text-center relative z-10">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-12"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 -translate-y-12"></div>
            <div className="absolute bottom-0 left-1/4 w-20 h-20 bg-white rounded-full -translate-x-10 translate-y-10"></div>
          </div>
          
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
              <BookOpen className="w-12 h-12 text-white" />
            </div>
          </div>
          
          {/* Main Heading */}
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            Business Statistics II
          </h1>
          
          {/* Subheading */}
          <p className="text-2xl text-white/90 font-medium mb-6">
            Interactive Learning Simulator
          </p>
          
          {/* Description */}
          <p className="text-lg text-white/80 max-w-3xl mx-auto leading-relaxed">
            Master statistical concepts through interactive simulations, step-by-step calculations, 
            and hands-on practice. Each module includes theory, guided examples, and practical tools 
            to enhance your understanding of business statistics.
          </p>
        </div>
      </div>

      {/* YouTube Video Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center flex items-center justify-center">
          🎥 Learn about this simulator
        </h2>
        
        {/* Language Dropdown */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="flex justify-center">
            <div className="relative">
              <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 mb-2">
                Select Video Language
              </label>
              <div className="relative">
                <select
                  id="language-select"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm min-w-[200px]"
                >
                  {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Video Player */}
        <div className="max-w-4xl mx-auto">
          <div className="relative w-full h-[400px] rounded-xl shadow-lg overflow-hidden">
            <iframe
              src={videoUrls[selectedLanguage as keyof typeof videoUrls]}
              title="Business Statistics II Simulator Introduction"
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>

      {/* Rest of the content remains unchanged */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {modules.map((module) => {
          const Icon = module.icon;
          
          return (
            <Link
              key={module.id}
              to={`/${module.id}`}
              className="group bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 ml-4">
                    {module.title}
                  </h3>
                </div>
                
                <p className="text-gray-600 mb-6">
                  {module.description}
                </p>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Key Features:
                  </h4>
                  {module.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                  Explore Module →
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Simulator
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Learn</h3>
              <p className="text-sm text-gray-600">
                Study theory and concepts with clear explanations and worked examples
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Practice</h3>
              <p className="text-sm text-gray-600">
                Test your knowledge with interactive questions and immediate feedback
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Simulate</h3>
              <p className="text-sm text-gray-600">
                Use interactive calculators and visualizations with your own data
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;