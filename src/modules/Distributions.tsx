import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Calculator, BookOpen, Play } from 'lucide-react';
import TabsContainer from '../components/TabsContainer';
import DataTable from '../components/DataTable';
import StepBox from '../components/StepBox';
import { factorial, combination, erf } from '../utils/math';
import { distributionsSampleData } from '../utils/sampleData';

const Distributions: React.FC = () => {
  const [activeTab, setActiveTab] = useState('definition');
  
  // Binomial Distribution State
  const [binomialN, setBinomialN] = useState('12');
  const [binomialP, setBinomialP] = useState('0.3');
  const [binomialK, setBinomialK] = useState('5');
  
  // Poisson Distribution State
  const [poissonLambda, setPoissonLambda] = useState('3.2');
  const [poissonK, setPoissonK] = useState('3');
  
  // Normal Distribution State
  const [normalMean, setNormalMean] = useState('50');
  const [normalStdDev, setNormalStdDev] = useState('10');
  const [normalX1, setNormalX1] = useState('45');
  const [normalX2, setNormalX2] = useState('55');
  
  // Normal Fitting State
  const [fittingData, setFittingData] = useState(distributionsSampleData.normalFitting);
  const [fittingMean, setFittingMean] = useState('47.5');
  const [fittingStdDev, setFittingStdDev] = useState('7.5');

  // Binomial calculations
  const calculateBinomial = (n: number, k: number, p: number) => {
    if (n < 0 || k < 0 || k > n || p < 0 || p > 1) return 0;
    const nCk = combination(n, k);
    const prob = nCk * Math.pow(p, k) * Math.pow(1 - p, n - k);
    return prob;
  };

  const nVal = parseInt(binomialN) || 0;
  const pVal = parseFloat(binomialP) || 0;
  const kVal = parseInt(binomialK) || 0;
  const binomialMean = nVal * pVal;
  const binomialVariance = nVal * pVal * (1 - pVal);
  const binomialProb = calculateBinomial(nVal, kVal, pVal);

  // Poisson calculations
  const calculatePoisson = (lambda: number, k: number) => {
    if (lambda <= 0 || k < 0) return 0;
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
  };

  const lambdaVal = parseFloat(poissonLambda) || 0;
  const poissonKVal = parseInt(poissonK) || 0;
  const poissonProb = calculatePoisson(lambdaVal, poissonKVal);

  // Normal distribution calculations
  const normalCDF = (x: number, mean: number, stdDev: number) => {
    const z = (x - mean) / stdDev;
    return 0.5 * (1 + erf(z / Math.sqrt(2)));
  };

  const meanVal = parseFloat(normalMean) || 0;
  const stdDevVal = parseFloat(normalStdDev) || 1;
  const x1Val = parseFloat(normalX1) || 0;
  const x2Val = parseFloat(normalX2) || 0;
  const normalProbability = normalCDF(x2Val, meanVal, stdDevVal) - normalCDF(x1Val, meanVal, stdDevVal);
  const z1 = (x1Val - meanVal) / stdDevVal;
  const z2 = (x2Val - meanVal) / stdDevVal;

  // Normal fitting calculations
  const calculateNormalFitting = () => {
    const totalFreq = fittingData.reduce((sum, item) => sum + item.frequency, 0);
    const fittingMeanVal = parseFloat(fittingMean) || 0;
    const fittingStdDevVal = parseFloat(fittingStdDev) || 1;
    
    return fittingData.map(item => {
      const [lower, upper] = item.class.split('-').map(Number);
      const z1 = (lower - fittingMeanVal) / fittingStdDevVal;
      const z2 = (upper - fittingMeanVal) / fittingStdDevVal;
      const area = normalCDF(upper, fittingMeanVal, fittingStdDevVal) - normalCDF(lower, fittingMeanVal, fittingStdDevVal);
      const expected = totalFreq * area;
      const chiSquare = Math.pow(item.frequency - expected, 2) / expected;
      
      return {
        class: item.class,
        observed: item.frequency,
        z1: z1.toFixed(3),
        z2: z2.toFixed(3),
        area: area.toFixed(4),
        expected: expected.toFixed(2),
        chiSquare: chiSquare.toFixed(3)
      };
    });
  };

  const fittingResults = calculateNormalFitting();
  const totalChiSquare = fittingResults.reduce((sum, item) => sum + parseFloat(item.chiSquare), 0);

  // Generate chart data
  const generateBinomialData = () => {
    const data = [];
    for (let k = 0; k <= Math.min(nVal, 20); k++) {
      data.push({
        k,
        probability: calculateBinomial(nVal, k, pVal)
      });
    }
    return data;
  };

  const generatePoissonData = () => {
    const data = [];
    for (let k = 0; k <= Math.min(lambdaVal * 3, 20); k++) {
      data.push({
        k,
        probability: calculatePoisson(lambdaVal, k)
      });
    }
    return data;
  };

  const generateNormalData = () => {
    const data = [];
    const start = meanVal - 3 * stdDevVal;
    const end = meanVal + 3 * stdDevVal;
    const step = (end - start) / 100;
    
    for (let x = start; x <= end; x += step) {
      const z = (x - meanVal) / stdDevVal;
      const y = (1 / (stdDevVal * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
      data.push({ x: x.toFixed(1), y });
    }
    return data;
  };

  const tabs = [
    {
      id: 'definition',
      label: 'Definition',
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          {/* Definition Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              📘 Definition & Key Concepts
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Theoretical Definition</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Theoretical distributions are mathematical models that describe the probability of different outcomes.
                  They provide standardized frameworks for analyzing random phenomena and making statistical inferences.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Key Distributions</h4>
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">1. Binomial Distribution</h5>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Used for discrete events with fixed number of trials and constant probability.
                    </p>
                    <div className="font-mono text-sm bg-white dark:bg-gray-600 p-2 rounded">
                      P(X = k) = C(n,k) × p^k × (1-p)^(n-k)
                    </div>
                    <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
                      <strong>Mean:</strong> np, <strong>Variance:</strong> np(1-p)
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">2. Poisson Distribution</h5>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Used for rare events occurring in fixed intervals.
                    </p>
                    <div className="font-mono text-sm bg-white dark:bg-gray-600 p-2 rounded">
                      P(X = k) = (λ^k × e^(-λ)) / k!
                    </div>
                    <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
                      <strong>Mean:</strong> λ, <strong>Variance:</strong> λ
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">3. Normal Distribution</h5>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Continuous distribution with bell-shaped curve, fundamental to statistical inference.
                    </p>
                    <div className="font-mono text-sm bg-white dark:bg-gray-600 p-2 rounded">
                      f(x) = (1/σ√(2π)) × e^(-(x-μ)²/2σ²)
                    </div>
                    <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
                      <strong>Mean:</strong> μ, <strong>Variance:</strong> σ²
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Properties & Characteristics</h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• <strong>Binomial:</strong> Discrete, bounded, symmetric when p = 0.5</li>
                  <li>• <strong>Poisson:</strong> Discrete, unbounded, right-skewed for small λ</li>
                  <li>• <strong>Normal:</strong> Continuous, symmetric, 68-95-99.7 rule</li>
                  <li>• <strong>Central Limit Theorem:</strong> Sum of many random variables approaches normal</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Applications Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              📊 Real-World Applications & Business Understanding
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                  🌍 Real-World Applications & Use Cases
                </h4>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li><strong>Binomial:</strong> Quality control, survey responses, coin flips</li>
                  <li><strong>Poisson:</strong> Customer arrivals, defect counts, accident rates</li>
                  <li><strong>Normal:</strong> Height/weight distributions, test scores, measurement errors</li>
                  <li><strong>Business Analytics:</strong> Demand forecasting, risk assessment</li>
                  <li><strong>Quality Management:</strong> Process control, defect analysis</li>
                  <li><strong>Financial Modeling:</strong> Stock returns, option pricing</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                  💡 Business Understanding
                </h4>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li><strong>Distribution Shape:</strong> Indicates data characteristics and patterns</li>
                  <li><strong>Mean vs Median:</strong> Skewness affects central tendency measures</li>
                  <li><strong>Standard Deviation:</strong> Measures variability and risk</li>
                  <li><strong>Confidence Intervals:</strong> Range of likely values for parameters</li>
                  <li><strong>Hypothesis Testing:</strong> Determine if results are statistically significant</li>
                  <li><strong>Process Capability:</strong> Assess if process meets specifications</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'simulator',
      label: 'Simulator',
      icon: Calculator,
      content: (
        <div className="space-y-6">
          {/* Binomial Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Binomial Distribution</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Number of trials (n)</label>
                  <input
                    type="number"
                    value={binomialN}
                    onChange={(e) => setBinomialN(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    min="1"
                    max="100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Probability of success (p)</label>
                  <input
                    type="number"
                    value={binomialP}
                    onChange={(e) => setBinomialP(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    min="0"
                    max="1"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Number of successes (k)</label>
                  <input
                    type="number"
                    value={binomialK}
                    onChange={(e) => setBinomialK(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    min="0"
                    max={nVal}
                  />
                </div>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={generateBinomialData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="k" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value.toFixed(4), 'Probability']} />
                    <Bar dataKey="probability" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <StepBox
              title="Binomial Calculation Steps"
              steps={[
                {
                  title: 'Given Parameters',
                  calculation: `n = ${nVal}, p = ${pVal}, k = ${kVal}`,
                  result: 'Parameters identified'
                },
                {
                  title: 'Calculate Combination',
                  formula: 'C(n,k) = n! / (k!(n-k)!)',
                  calculation: `C(${nVal}, ${kVal}) = ${nVal}! / (${kVal}!(${nVal-kVal})!) = ${combination(nVal, kVal)}`,
                  result: `C(${nVal}, ${kVal}) = ${combination(nVal, kVal)}`
                },
                {
                  title: 'Apply Binomial Formula',
                  formula: 'P(X = k) = C(n,k) × p^k × (1-p)^(n-k)',
                  calculation: `P(X = ${kVal}) = ${combination(nVal, kVal)} × ${pVal}^${kVal} × ${(1-pVal).toFixed(3)}^${nVal-kVal}`,
                  result: `P(X = ${kVal}) = ${binomialProb.toFixed(6)}`
                },
                {
                  title: 'Calculate Mean',
                  formula: 'Mean = np',
                  calculation: `Mean = ${nVal} × ${pVal} = ${binomialMean.toFixed(2)}`,
                  result: `Mean = ${binomialMean.toFixed(2)}`
                },
                {
                  title: 'Calculate Variance',
                  formula: 'Variance = np(1-p)',
                  calculation: `Variance = ${nVal} × ${pVal} × ${(1-pVal).toFixed(3)} = ${binomialVariance.toFixed(2)}`,
                  result: `Variance = ${binomialVariance.toFixed(2)}`
                }
              ]}
            />
          </div>

          {/* Poisson Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Poisson Distribution</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Lambda (λ)</label>
                  <input
                    type="number"
                    value={poissonLambda}
                    onChange={(e) => setPoissonLambda(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    min="0.1"
                    step="0.1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Number of events (k)</label>
                  <input
                    type="number"
                    value={poissonK}
                    onChange={(e) => setPoissonK(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={generatePoissonData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="k" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value.toFixed(4), 'Probability']} />
                    <Bar dataKey="probability" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <StepBox
              title="Poisson Calculation Steps"
              steps={[
                {
                  title: 'Given Parameters',
                  calculation: `λ = ${lambdaVal}, k = ${poissonKVal}`,
                  result: 'Parameters identified'
                },
                {
                  title: 'Apply Poisson Formula',
                  formula: 'P(X = k) = (λ^k × e^(-λ)) / k!',
                  calculation: `P(X = ${poissonKVal}) = (${lambdaVal}^${poissonKVal} × e^(-${lambdaVal})) / ${poissonKVal}!`,
                  result: 'Formula applied'
                },
                {
                  title: 'Calculate Components',
                  calculation: `λ^k = ${lambdaVal}^${poissonKVal} = ${Math.pow(lambdaVal, poissonKVal).toFixed(4)}, e^(-λ) = e^(-${lambdaVal}) = ${Math.exp(-lambdaVal).toFixed(4)}, k! = ${poissonKVal}! = ${factorial(poissonKVal)}`,
                  result: 'Components calculated'
                },
                {
                  title: 'Final Calculation',
                  calculation: `P(X = ${poissonKVal}) = (${Math.pow(lambdaVal, poissonKVal).toFixed(4)} × ${Math.exp(-lambdaVal).toFixed(4)}) / ${factorial(poissonKVal)} = ${poissonProb.toFixed(6)}`,
                  result: `P(X = ${poissonKVal}) = ${poissonProb.toFixed(6)}`
                },
                {
                  title: 'Mean and Variance',
                  formula: 'Mean = Variance = λ',
                  calculation: `Mean = Variance = ${lambdaVal}`,
                  result: `Mean = Variance = ${lambdaVal}`
                }
              ]}
            />
          </div>

          {/* Normal Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Normal Distribution</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Mean (μ)</label>
                  <input
                    type="number"
                    value={normalMean}
                    onChange={(e) => setNormalMean(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Standard Deviation (σ)</label>
                  <input
                    type="number"
                    value={normalStdDev}
                    onChange={(e) => setNormalStdDev(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    min="0.1"
                    step="0.1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Lower bound (x₁)</label>
                  <input
                    type="number"
                    value={normalX1}
                    onChange={(e) => setNormalX1(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Upper bound (x₂)</label>
                  <input
                    type="number"
                    value={normalX2}
                    onChange={(e) => setNormalX2(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={generateNormalData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="x" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="y" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <StepBox
              title="Normal Distribution Calculation Steps"
              steps={[
                {
                  title: 'Given Parameters',
                  calculation: `μ = ${meanVal}, σ = ${stdDevVal}`,
                  result: 'Parameters identified'
                },
                {
                  title: 'Problem Statement',
                  calculation: `Find P(${x1Val} < X < ${x2Val})`,
                  result: 'Probability range defined'
                },
                {
                  title: 'Calculate Z-scores',
                  formula: 'z = (x - μ) / σ',
                  calculation: `z₁ = (${x1Val} - ${meanVal}) / ${stdDevVal} = ${z1.toFixed(3)}, z₂ = (${x2Val} - ${meanVal}) / ${stdDevVal} = ${z2.toFixed(3)}`,
                  result: `z₁ = ${z1.toFixed(3)}, z₂ = ${z2.toFixed(3)}`
                },
                {
                  title: 'Apply Standard Normal CDF',
                  formula: 'P(a < X < b) = Φ(z₂) - Φ(z₁)',
                  calculation: `P(${x1Val} < X < ${x2Val}) = Φ(${z2.toFixed(3)}) - Φ(${z1.toFixed(3)})`,
                  result: 'CDF formula applied'
                },
                {
                  title: 'Final Result',
                  calculation: `P(${x1Val} < X < ${x2Val}) = ${normalCDF(x2Val, meanVal, stdDevVal).toFixed(4)} - ${normalCDF(x1Val, meanVal, stdDevVal).toFixed(4)} = ${normalProbability.toFixed(4)}`,
                  result: `P(${x1Val} < X < ${x2Val}) = ${normalProbability.toFixed(4)}`
                }
              ]}
            />
          </div>

          {/* Normal Fitting */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Fitting Normal Distribution</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Assumed Mean (μ)</label>
                <input
                  type="number"
                  value={fittingMean}
                  onChange={(e) => setFittingMean(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Assumed Standard Deviation (σ)</label>
                <input
                  type="number"
                  value={fittingStdDev}
                  onChange={(e) => setFittingStdDev(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  min="0.1"
                  step="0.1"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">Class</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">Observed (f)</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">z₁</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">z₂</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">Area</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">Expected (fe)</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">χ²</th>
                  </tr>
                </thead>
                <tbody>
                  {fittingResults.map((row, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{row.class}</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{row.observed}</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{row.z1}</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{row.z2}</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{row.area}</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{row.expected}</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{row.chiSquare}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 dark:bg-gray-700 font-semibold">
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2" colSpan={6}>Total χ²</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{totalChiSquare.toFixed(3)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <StepBox
              title="Normal Fitting Steps"
              steps={[
                {
                  title: 'Given Parameters',
                  calculation: `μ = ${parseFloat(fittingMean) || 0}, σ = ${parseFloat(fittingStdDev) || 1}`,
                  result: 'Assumed normal distribution parameters'
                },
                {
                  title: 'Calculate Z-scores for Class Boundaries',
                  formula: 'z = (x - μ) / σ',
                  calculation: 'For each class interval, calculate z₁ and z₂',
                  result: 'Z-scores calculated for all class boundaries'
                },
                {
                  title: 'Find Areas Under Normal Curve',
                  formula: 'Area = Φ(z₂) - Φ(z₁)',
                  calculation: 'Using standard normal CDF for each interval',
                  result: 'Areas calculated for all intervals'
                },
                {
                  title: 'Calculate Expected Frequencies',
                  formula: 'Expected frequency = Total frequency × Area',
                  calculation: `Total frequency = ${fittingData.reduce((sum, item) => sum + item.frequency, 0)}`,
                  result: 'Expected frequencies calculated'
                },
                {
                  title: 'Chi-square Test Statistic',
                  formula: 'χ² = Σ[(Observed - Expected)² / Expected]',
                  calculation: 'Sum of chi-square components for all classes',
                  result: `Total χ² = ${totalChiSquare.toFixed(3)}`
                },
                {
                  title: 'Interpretation',
                  calculation: `Compare χ² = ${totalChiSquare.toFixed(3)} with critical value`,
                  result: 'Use appropriate degrees of freedom for hypothesis test'
                }
              ]}
            />
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Theoretical Distributions</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Explore binomial, Poisson, and normal distributions with interactive calculators and visualizations.
        </p>
      </div>
      
      <TabsContainer
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};

export default Distributions;