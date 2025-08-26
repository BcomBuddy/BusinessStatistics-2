import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import StepBox from '../components/StepBox';
import TabsContainer from '../components/TabsContainer';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ScatterChart, Scatter, ResponsiveContainer } from 'recharts';
import { mean, sum, correlation, round } from '../utils/math';
import { regressionSampleData } from '../utils/sampleData';
import { saveState, loadState } from '../utils/storage';

interface RegressionData {
  x: number;
  y: number;
}

const Regression: React.FC = () => {
  const [data, setData] = useState<RegressionData[]>([]);
  const [results, setResults] = useState<any>(null);
  const [predictionX, setPredictionX] = useState<string>('');
  const [predictionY, setPredictionY] = useState<string>('');

  useEffect(() => {
    const savedData = loadState('regressionData');
    if (savedData) {
      setData(savedData);
    }
  }, []);

  useEffect(() => {
    saveState('regressionData', data);
    if (data.length >= 2) {
      calculateRegression();
    }
  }, [data]);

  const calculateRegression = () => {
    const x = data.map(d => d.x);
    const y = data.map(d => d.y);
    
    const n = x.length;
    const xMean = mean(x);
    const yMean = mean(y);
    
    const xDev = x.map(xi => xi - xMean);
    const yDev = y.map(yi => yi - yMean);
    
    const xDevSq = xDev.map(d => d * d);
    const yDevSq = yDev.map(d => d * d);
    const xyDev = xDev.map((xd, i) => xd * yDev[i]);
    
    const sumX = sum(x);
    const sumY = sum(y);
    const sumXDev2 = sum(xDevSq);
    const sumYDev2 = sum(yDevSq);
    const sumXYDev = sum(xyDev);
    
    const r = correlation(x, y);
    const bYX = sumXYDev / sumXDev2;  // Y on X
    const bXY = sumXYDev / sumYDev2;  // X on Y
    
    // Regression line equations
    const yOnX = (xVal: number) => yMean + bYX * (xVal - xMean);
    const xOnY = (yVal: number) => xMean + bXY * (yVal - yMean);
    
    // Properties check
    const rSquaredCheck = Math.abs(r * r - bYX * bXY) < 0.001;
    const slopeSignCheck = (bYX > 0 && bXY > 0) || (bYX < 0 && bXY < 0);
    
    setResults({
      n,
      xMean: round(xMean),
      yMean: round(yMean),
      sumX: round(sumX),
      sumY: round(sumY),
      sumXDev2: round(sumXDev2),
      sumYDev2: round(sumYDev2),
      sumXYDev: round(sumXYDev),
      r: round(r),
      bYX: round(bYX),
      bXY: round(bXY),
      rSquaredCheck,
      slopeSignCheck,
      yOnX,
      xOnY,
      detailsTable: data.map((point, i) => ({
        ...point,
        xDev: round(xDev[i]),
        yDev: round(yDev[i]),
        xDevSq: round(xDevSq[i]),
        yDevSq: round(yDevSq[i]),
        xyDev: round(xyDev[i])
      }))
    });
  };

  const getSteps = () => {
    if (!results) return [];
    
    return [
      {
        title: 'Calculate Means',
        formula: 'X̄ = ΣX/n, Ȳ = ΣY/n',
        calculation: `X̄ = ${results.sumX}/${results.n} = ${results.xMean}, Ȳ = ${results.sumY}/${results.n} = ${results.yMean}`,
        result: `X̄ = ${results.xMean}, Ȳ = ${results.yMean}`
      },
      {
        title: 'Calculate Deviations and Products',
        formula: 'Σ(X-X̄)², Σ(Y-Ȳ)², Σ(X-X̄)(Y-Ȳ)',
        calculation: `Σ(X-X̄)² = ${results.sumXDev2}, Σ(Y-Ȳ)² = ${results.sumYDev2}, Σ(X-X̄)(Y-Ȳ) = ${results.sumXYDev}`,
        result: `Sxx = ${results.sumXDev2}, Syy = ${results.sumYDev2}, Sxy = ${results.sumXYDev}`
      },
      {
        title: 'Calculate Correlation Coefficient',
        formula: 'r = Sxy / √(Sxx × Syy)',
        calculation: `r = ${results.sumXYDev} / √(${results.sumXDev2} × ${results.sumYDev2}) = ${results.sumXYDev} / ${round(Math.sqrt(results.sumXDev2 * results.sumYDev2))}`,
        result: `r = ${results.r}`
      },
      {
        title: 'Calculate Regression Coefficients',
        formula: 'bYX = Sxy/Sxx, bXY = Sxy/Syy',
        calculation: `bYX = ${results.sumXYDev}/${results.sumXDev2} = ${results.bYX}, bXY = ${results.sumXYDev}/${results.sumYDev2} = ${results.bXY}`,
        result: `bYX = ${results.bYX}, bXY = ${results.bXY}`
      },
      {
        title: 'Regression Line Equations',
        formula: 'Y - Ȳ = bYX(X - X̄), X - X̄ = bXY(Y - Ȳ)',
        calculation: `Y - ${results.yMean} = ${results.bYX}(X - ${results.xMean}), X - ${results.xMean} = ${results.bXY}(Y - ${results.yMean})`,
        result: `Lines of regression calculated`
      },
      {
        title: 'Property Verification',
        formula: 'r² ≈ bYX × bXY',
        calculation: `${round(results.r * results.r)} ≈ ${round(results.bYX * results.bXY)}`,
        result: `r² = bYX × bXY: ${results.rSquaredCheck ? '✓ Verified' : '✗ Failed'}, Slope signs consistent: ${results.slopeSignCheck ? '✓ Yes' : '✗ No'}`
      }
    ];
  };

  const getChartData = () => {
    if (!data.length || !results) return [];
    
    const minX = Math.min(...data.map(d => d.x));
    const maxX = Math.max(...data.map(d => d.x));
    const range = maxX - minX;
    const chartData = [];
    
    for (let i = 0; i <= 20; i++) {
      const x = minX - range * 0.1 + (range * 1.2 * i) / 20;
      chartData.push({
        x: round(x, 2),
        yOnX: round(results.yOnX(x), 2),
        xOnY: round(x, 2), // For X on Y line, we need to solve for X given Y
        scatter: data.find(d => Math.abs(d.x - x) < range / 40) || null
      });
    }
    
    return chartData;
  };

  const predictY = () => {
    if (results) {
      const x = parseFloat(predictionX) || 0;
      return round(results.yOnX(x), 4);
    }
    return 0;
  };

  const predictX = () => {
    if (results) {
      const y = parseFloat(predictionY) || 0;
      return round(results.xOnY(y), 4);
    }
    return 0;
  };

  const loadSampleData = () => {
    setData(regressionSampleData);
  };

  const learnContent = (
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
              <strong>Correlation</strong> measures the strength and direction of linear relationship between two variables,
              while <strong>Regression</strong> helps us predict one variable from another using mathematical relationships.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Key Formulas</h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li><strong>Correlation Coefficient:</strong> r = Sxy / √(Sxx × Syy)</li>
              <li><strong>Regression of Y on X:</strong> Y - Ȳ = bYX(X - X̄), where bYX = Sxy/Sxx</li>
              <li><strong>Regression of X on Y:</strong> X - X̄ = bXY(Y - Ȳ), where bXY = Sxy/Syy</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Properties</h4>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
              <li>• r² = bYX × bXY</li>
              <li>• Both regression lines pass through (X̄, Ȳ)</li>
              <li>• If r = ±1, both lines coincide</li>
              <li>• If r = 0, lines are perpendicular</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Worked Example</h4>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400 mb-2">Given data: X = [2, 4, 6, 8, 10], Y = [4, 5, 7, 8, 11]</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>X̄ = 30/5 = 6, Ȳ = 35/5 = 7</li>
                <li>Sxx = Σ(X-X̄)² = 40, Syy = Σ(Y-Ȳ)² = 30, Sxy = Σ(X-X̄)(Y-Ȳ) = 34</li>
                <li>r = 34/√(40×30) = 34/34.64 = 0.982</li>
                <li>bYX = 34/40 = 0.85, bXY = 34/30 = 1.133</li>
                <li>Y - 7 = 0.85(X - 6) → Y = 0.85X + 1.9</li>
              </ol>
            </div>
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
              <li><strong>Financial Forecasting:</strong> Predict sales, stock prices, and market trends</li>
              <li><strong>Marketing Analytics:</strong> Analyze customer behavior and campaign effectiveness</li>
              <li><strong>Operations Management:</strong> Forecast inventory demand and production needs</li>
              <li><strong>Risk Assessment:</strong> Evaluate credit risk and insurance claims</li>
              <li><strong>Quality Control:</strong> Monitor manufacturing processes and product quality</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
              💡 Business Understanding
            </h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li><strong>Strong Correlation (r &gt; 0.7):</strong> Reliable predictions, strong relationships</li>
              <li><strong>Moderate Correlation (0.3 &lt; r &lt; 0.7):</strong> Useful predictions with some uncertainty</li>
              <li><strong>Weak Correlation (r &lt; 0.3):</strong> Limited predictive power, external influences</li>
              <li><strong>Positive r:</strong> Variables move together in same direction</li>
              <li><strong>Negative r:</strong> Variables move in opposite directions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const practiceContent = (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Practice Problem</h3>
        <p className="mb-4">
          Given the following data, calculate the correlation coefficient and regression lines:
        </p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>X: 1, 3, 5, 7, 9</div>
          <div>Y: 2, 6, 7, 8, 12</div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Correlation coefficient (r):</label>
            <input 
              type="number" 
              step="0.001"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
              placeholder="Enter r value"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Regression coefficient bYX:</label>
            <input 
              type="number" 
              step="0.001"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
              placeholder="Enter bYX value"
            />
          </div>
          
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Check Answer
          </button>
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">Solution Steps (Click to reveal)</h4>
        <details className="text-sm">
          <summary className="cursor-pointer text-blue-600 dark:text-blue-400">Show Solution</summary>
          <div className="mt-2 space-y-2">
            <p>1. X̄ = 25/5 = 5, Ȳ = 35/5 = 7</p>
            <p>2. Sxx = 40, Syy = 46, Sxy = 40</p>
            <p>3. r = 40/√(40×46) = 40/42.97 = 0.931</p>
            <p>4. bYX = 40/40 = 1.0</p>
            <p>5. Regression line: Y - 7 = 1.0(X - 5) → Y = X + 2</p>
          </div>
        </details>
      </div>
    </div>
  );

  const simulatorContent = (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <DataTable
          data={data}
          columns={[
            { key: 'x', label: 'X', type: 'number' },
            { key: 'y', label: 'Y', type: 'number' }
          ]}
          onChange={setData}
          onLoadSample={loadSampleData}
        />
        
        {results && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4">Predictions</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Predict Y for X =</label>
                <input
                  type="number"
                  step="0.01"
                  value={predictionX}
                  onChange={(e) => setPredictionX(e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 mr-4"
                />
                <span className="text-lg font-medium">Y = {predictY()}</span>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Predict X for Y =</label>
                <input
                  type="number"
                  step="0.01"
                  value={predictionY}
                  onChange={(e) => setPredictionY(e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 mr-4"
                />
                <span className="text-lg font-medium">X = {predictX()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-6">
        {results && data.length > 0 && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Results Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>n = {results.n}</div>
                <div>X̄ = {results.xMean}</div>
                <div>Ȳ = {results.yMean}</div>
                <div>r = {results.r}</div>
                <div>bYX = {results.bYX}</div>
                <div>bXY = {results.bXY}</div>
              </div>
              <div className="mt-4 text-sm">
                <div className="flex items-center space-x-2">
                  <span className={results.rSquaredCheck ? 'text-green-600' : 'text-red-600'}>
                    {results.rSquaredCheck ? '✓' : '✗'}
                  </span>
                  <span>r² = bYX × bXY property</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Scatter Plot with Regression Lines</h3>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" type="number" domain={['dataMin - 1', 'dataMax + 1']} />
                  <YAxis dataKey="y" type="number" domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip />
                  <Scatter data={data} fill="#3B82F6" />
                  <Line 
                    dataKey="yOnX" 
                    stroke="#EF4444" 
                    strokeWidth={2} 
                    dot={false}
                    name="Y on X"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
      
      {results && (
        <div className="lg:col-span-2">
          <StepBox title="Step-by-Step Calculations" steps={getSteps()} />
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: 'definition', label: 'Definition', content: learnContent },
    { id: 'simulator', label: 'Simulator', content: simulatorContent }
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Regression Analysis
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Learn correlation, regression coefficients, and predictive modeling
        </p>
      </div>
      
      <TabsContainer tabs={tabs} defaultTab="simulator" />
    </div>
  );
};

export default Regression;