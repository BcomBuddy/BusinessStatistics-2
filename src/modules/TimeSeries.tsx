import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import StepBox from '../components/StepBox';
import TabsContainer from '../components/TabsContainer';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { mean, sum, round } from '../utils/math';
import { timeSeriesSampleData } from '../utils/sampleData';
import { saveState, loadState } from '../utils/storage';

interface TimeSeriesData {
  period: string;
  value: number;
}

type TrendMethod = 'semi-averages' | 'least-squares';
type MovingAverageType = 3 | 5 | 7;

const TimeSeries: React.FC = () => {
  const [data, setData] = useState<TimeSeriesData[]>([]);
  const [trendMethod, setTrendMethod] = useState<TrendMethod>('least-squares');
  const [maWindow, setMaWindow] = useState<MovingAverageType>(3);
  const [forecastPeriods, setForecastPeriods] = useState<number>(4);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    const savedData = loadState('timeSeriesData');
    if (savedData) {
      setData(savedData);
    }
  }, []);

  useEffect(() => {
    saveState('timeSeriesData', data);
    if (data.length >= 4) {
      analyzeTimeSeries();
    }
  }, [data, trendMethod, maWindow, forecastPeriods]);

  const analyzeTimeSeries = () => {
    if (data.length < 4) return;

    const n = data.length;
    const values = data.map(d => d.value);
    
    // Calculate trend
    let trendValues: number[] = [];
    let trendEquation = '';
    let trendSteps: any[] = [];

    if (trendMethod === 'semi-averages') {
      const mid = Math.floor(n / 2);
      const firstHalf = values.slice(0, mid);
      const secondHalf = values.slice(mid);
      
      const firstMean = mean(firstHalf);
      const secondMean = mean(secondHalf);
      
      const slope = (secondMean - firstMean) / mid;
      const intercept = firstMean - slope * (mid - 1) / 2;
      
      trendValues = Array.from({ length: n }, (_, i) => intercept + slope * i);
      trendEquation = `Y = ${round(intercept, 2)} + ${round(slope, 2)}X`;
      
      trendSteps = [
        {
          title: 'Divide data into two halves',
          calculation: `First half: ${firstHalf.join(', ')}, Second half: ${secondHalf.join(', ')}`,
          result: `n1 = ${firstHalf.length}, n2 = ${secondHalf.length}`
        },
        {
          title: 'Calculate means of each half',
          calculation: `First mean = ${sum(firstHalf)}/${firstHalf.length} = ${round(firstMean, 2)}, Second mean = ${sum(secondHalf)}/${secondHalf.length} = ${round(secondMean, 2)}`,
          result: `Ȳ1 = ${round(firstMean, 2)}, Ȳ2 = ${round(secondMean, 2)}`
        },
        {
          title: 'Calculate trend parameters',
          calculation: `Slope = (${round(secondMean, 2)} - ${round(firstMean, 2)}) / ${mid} = ${round(slope, 2)}`,
          result: `Trend equation: ${trendEquation}`
        }
      ];
    } else {
      // Least squares method
      const x = Array.from({ length: n }, (_, i) => i + 1);
      const xMean = mean(x);
      const yMean = mean(values);
      
      const xDev = x.map(xi => xi - xMean);
      const yDev = values.map(yi => yi - yMean);
      const xyDev = xDev.map((xd, i) => xd * yDev[i]);
      const xDevSq = xDev.map(xd => xd * xd);
      
      const sumXY = sum(xyDev);
      const sumX2 = sum(xDevSq);
      
      const b = sumXY / sumX2;
      const a = yMean - b * xMean;
      
      trendValues = x.map(xi => a + b * xi);
      trendEquation = `Y = ${round(a, 2)} + ${round(b, 2)}X`;
      
      trendSteps = [
        {
          title: 'Calculate means',
          calculation: `X̄ = ${sum(x)}/${n} = ${round(xMean, 2)}, Ȳ = ${sum(values)}/${n} = ${round(yMean, 2)}`,
          result: `X̄ = ${round(xMean, 2)}, Ȳ = ${round(yMean, 2)}`
        },
        {
          title: 'Calculate deviations and products',
          calculation: `Σ(X-X̄)(Y-Ȳ) = ${round(sumXY, 2)}, Σ(X-X̄)² = ${round(sumX2, 2)}`,
          result: `Sxy = ${round(sumXY, 2)}, Sxx = ${round(sumX2, 2)}`
        },
        {
          title: 'Calculate trend coefficients',
          calculation: `b = ${round(sumXY, 2)} / ${round(sumX2, 2)} = ${round(b, 2)}, a = ${round(yMean, 2)} - ${round(b, 2)} × ${round(xMean, 2)} = ${round(a, 2)}`,
          result: `Trend equation: ${trendEquation}`
        }
      ];
    }

    // Calculate moving averages
    const movingAverages: (number | null)[] = [];
    for (let i = 0; i < n; i++) {
      if (i < Math.floor(maWindow / 2) || i >= n - Math.floor(maWindow / 2)) {
        movingAverages.push(null);
      } else {
        const start = i - Math.floor(maWindow / 2);
        const end = start + maWindow;
        const windowValues = values.slice(start, end);
        movingAverages.push(mean(windowValues));
      }
    }

    // Calculate seasonal indices (simplified)
    const seasonalIndices: number[] = [];
    const deseasonalized: number[] = [];
    
    for (let i = 0; i < n; i++) {
      if (movingAverages[i] !== null) {
        const ratio = (values[i] / movingAverages[i]!) * 100;
        seasonalIndices.push(ratio);
        deseasonalized.push(values[i] / (ratio / 100));
      } else {
        seasonalIndices.push(100);
        deseasonalized.push(values[i]);
      }
    }

    // Generate forecasts
    const forecasts: number[] = [];
    for (let i = 1; i <= forecastPeriods; i++) {
      const futureX = n + i;
      let trendValue: number;
      
      if (trendMethod === 'semi-averages') {
        const slope = (trendValues[n-1] - trendValues[0]) / (n - 1);
        const intercept = trendValues[0];
        trendValue = intercept + slope * (futureX - 1);
      } else {
        const x = Array.from({ length: n }, (_, i) => i + 1);
        const xMean = mean(x);
        const yMean = mean(values);
        const xDev = x.map(xi => xi - xMean);
        const yDev = values.map(yi => yi - yMean);
        const xyDev = xDev.map((xd, i) => xd * yDev[i]);
        const xDevSq = xDev.map(xd => xd * xd);
        const b = sum(xyDev) / sum(xDevSq);
        const a = yMean - b * xMean;
        trendValue = a + b * futureX;
      }
      
      // Apply seasonal adjustment (simplified)
      const seasonalIndex = seasonalIndices[i % 4] || 100;
      const forecast = trendValue * (seasonalIndex / 100);
      forecasts.push(forecast);
    }

    setResults({
      trendValues,
      trendEquation,
      trendSteps,
      movingAverages,
      seasonalIndices,
      deseasonalized,
      forecasts,
      analysisTable: data.map((item, i) => ({
        period: item.period,
        actual: item.value,
        trend: round(trendValues[i], 2),
        movingAverage: movingAverages[i] ? round(movingAverages[i]!, 2) : null,
        seasonalIndex: round(seasonalIndices[i], 2),
        deseasonalized: round(deseasonalized[i], 2)
      }))
    });
  };

  const getChartData = () => {
    if (!results || !data.length) return [];
    
    const chartData = data.map((item, i) => ({
      period: item.period,
      actual: item.value,
      trend: results.trendValues[i],
      movingAverage: results.movingAverages[i],
      deseasonalized: results.deseasonalized[i]
    }));

    // Add forecast data
    for (let i = 0; i < results.forecasts.length; i++) {
      chartData.push({
        period: `F${i + 1}`,
        actual: null,
        trend: null,
        movingAverage: null,
        deseasonalized: null,
        forecast: results.forecasts[i]
      });
    }

    return chartData;
  };

  const loadSampleData = () => {
    setData(timeSeriesSampleData);
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
              Time series analysis involves studying data collected over time to identify patterns,
              trends, and seasonal variations for forecasting future values and understanding temporal dynamics.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Components of Time Series</h4>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
              <li>• <strong>Trend (T):</strong> Long-term movement in data over time</li>
              <li>• <strong>Seasonal (S):</strong> Regular patterns that repeat within a year</li>
              <li>• <strong>Cyclical (C):</strong> Long-term fluctuations beyond seasonal patterns</li>
              <li>• <strong>Irregular (I):</strong> Random variations and unpredictable events</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Key Formulas</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Trend Analysis:</h5>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• <strong>Least Squares:</strong> Y = a + bX</li>
                  <li>• <strong>Slope:</strong> b = Σ(X-X̄)(Y-Ȳ)/Σ(X-X̄)²</li>
                  <li>• <strong>Intercept:</strong> a = Ȳ - bX̄</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Moving Averages:</h5>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• <strong>3-term MA:</strong> (Y₁ + Y₂ + Y₃)/3</li>
                  <li>• <strong>5-term MA:</strong> (Y₁ + Y₂ + Y₃ + Y₄ + Y₅)/5</li>
                  <li>• <strong>7-term MA:</strong> (Y₁ + Y₂ + ... + Y₇)/7</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Seasonal Analysis</h4>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400 mb-2">Ratio-to-Moving-Average method:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>Calculate moving averages to remove trend and seasonal components</li>
                <li>Find ratios: (Actual/MA) × 100</li>
                <li>Average ratios for each season across years</li>
                <li>Adjust to sum to 400 (quarterly) or 1200 (monthly)</li>
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
              <li><strong>Sales Forecasting:</strong> Predict future sales based on historical patterns</li>
              <li><strong>Financial Markets:</strong> Stock price analysis and market trend prediction</li>
              <li><strong>Inventory Management:</strong> Seasonal demand forecasting and stock planning</li>
              <li><strong>Economic Indicators:</strong> GDP, unemployment, inflation rate analysis</li>
              <li><strong>Weather Prediction:</strong> Climate pattern analysis and seasonal forecasting</li>
              <li><strong>Quality Control:</strong> Manufacturing process monitoring over time</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
              💡 Business Understanding
            </h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li><strong>Strong Trend:</strong> Consistent growth/decline, reliable forecasting</li>
              <li><strong>Seasonal Patterns:</strong> Predictable business cycles, planning opportunities</li>
              <li><strong>High Volatility:</strong> Unstable market, increased uncertainty</li>
              <li><strong>Cyclical Fluctuations:</strong> Economic cycles, long-term planning needed</li>
              <li><strong>Moving Averages:</strong> Smooth out noise, reveal underlying trends</li>
              <li><strong>Forecast Accuracy:</strong> Depends on pattern stability and data quality</li>
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
        <p className="mb-4">Given quarterly sales data, find the trend using least squares:</p>
        
        <table className="w-full border-collapse border mb-4">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="border p-2">Quarter</th>
              <th className="border p-2">Sales</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="border p-2">Q1</td><td className="border p-2">120</td></tr>
            <tr><td className="border p-2">Q2</td><td className="border p-2">135</td></tr>
            <tr><td className="border p-2">Q3</td><td className="border p-2">150</td></tr>
            <tr><td className="border p-2">Q4</td><td className="border p-2">165</td></tr>
          </tbody>
        </table>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Trend equation (Y = a + bX):</label>
            <input 
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
              placeholder="Enter trend equation"
            />
          </div>
          
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Check Answer
          </button>
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <details className="text-sm">
          <summary className="cursor-pointer text-blue-600 dark:text-blue-400 font-semibold">Show Solution</summary>
          <div className="mt-2 space-y-2">
            <p><strong>Step 1:</strong> Code the periods: X = 1, 2, 3, 4</p>
            <p><strong>Step 2:</strong> Calculate means: X̄ = 2.5, Ȳ = 142.5</p>
            <p><strong>Step 3:</strong> Calculate deviations and products</p>
            <p><strong>Step 4:</strong> b = 15, a = 105</p>
            <p><strong>Answer:</strong> Y = 105 + 15X</p>
          </div>
        </details>
      </div>
    </div>
  );

  const simulatorContent = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DataTable
            data={data}
            columns={[
              { key: 'period', label: 'Period', type: 'text' },
              { key: 'value', label: 'Value', type: 'number' }
            ]}
            onChange={setData}
            onLoadSample={loadSampleData}
          />
        </div>
        
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4">Analysis Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Trend Method</label>
                <select
                  value={trendMethod}
                  onChange={(e) => setTrendMethod(e.target.value as TrendMethod)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                >
                  <option value="least-squares">Least Squares</option>
                  <option value="semi-averages">Semi-Averages</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Moving Average</label>
                <select
                  value={maWindow}
                  onChange={(e) => setMaWindow(parseInt(e.target.value) as MovingAverageType)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                >
                  <option value={3}>3-term</option>
                  <option value={5}>5-term</option>
                  <option value={7}>7-term</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Forecast Periods</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={forecastPeriods}
                  onChange={(e) => setForecastPeriods(e.target.value === '' ? 4 : parseInt(e.target.value) || 4)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                />
              </div>
            </div>
          </div>
          
          {results && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Results</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Trend Equation:</strong> {results.trendEquation}</div>
                <div><strong>Forecasts:</strong></div>
                {results.forecasts.map((forecast: number, i: number) => (
                  <div key={i} className="ml-4">
                    Period {data.length + i + 1}: {round(forecast, 2)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {results && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4">Time Series Chart</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line dataKey="actual" stroke="#3B82F6" strokeWidth={2} name="Actual" />
                <Line dataKey="trend" stroke="#EF4444" strokeWidth={2} name="Trend" />
                <Line dataKey="movingAverage" stroke="#10B981" strokeWidth={2} name="Moving Average" />
                <Line dataKey="forecast" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 5" name="Forecast" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <StepBox title="Trend Analysis Steps" steps={results.trendSteps} />
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4">Detailed Analysis Table</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200 dark:border-gray-600">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="border border-gray-200 dark:border-gray-600 p-2">Period</th>
                    <th className="border border-gray-200 dark:border-gray-600 p-2">Actual</th>
                    <th className="border border-gray-200 dark:border-gray-600 p-2">Trend</th>
                    <th className="border border-gray-200 dark:border-gray-600 p-2">Moving Average</th>
                    <th className="border border-gray-200 dark:border-gray-600 p-2">Seasonal Index</th>
                    <th className="border border-gray-200 dark:border-gray-600 p-2">Deseasonalized</th>
                  </tr>
                </thead>
                <tbody>
                  {results.analysisTable.map((row: any, index: number) => (
                    <tr key={index}>
                      <td className="border border-gray-200 dark:border-gray-600 p-2">{row.period}</td>
                      <td className="border border-gray-200 dark:border-gray-600 p-2">{row.actual}</td>
                      <td className="border border-gray-200 dark:border-gray-600 p-2">{row.trend}</td>
                      <td className="border border-gray-200 dark:border-gray-600 p-2">{row.movingAverage || '-'}</td>
                      <td className="border border-gray-200 dark:border-gray-600 p-2">{row.seasonalIndex}</td>
                      <td className="border border-gray-200 dark:border-gray-600 p-2">{row.deseasonalized}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
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
          Time Series Analysis
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Analyze trends, seasonal patterns, and forecast future values
        </p>
      </div>
      
      <TabsContainer tabs={tabs} defaultTab="simulator" />
    </div>
  );
};

export default TimeSeries;