import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  BarChart3, 
  Activity, 
  Dice6, 
  Calculator, 
  BookOpen 
} from 'lucide-react';

const Home: React.FC = () => {
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
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-6">
          <BookOpen className="w-12 h-12 text-blue-600 mr-4" />
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Business Statistics II
            </h1>
            <p className="text-xl text-gray-600">
              Interactive Learning Simulator
            </p>
          </div>
        </div>
        
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Master statistical concepts through interactive simulations, step-by-step calculations, 
          and hands-on practice. Each module includes theory, guided examples, and practical tools 
          to enhance your understanding of business statistics.
        </p>
      </div>

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