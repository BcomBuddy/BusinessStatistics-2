import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import StepBox from '../components/StepBox';
import TabsContainer from '../components/TabsContainer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { round, sum } from '../utils/math';
import { indexNumbersSampleData } from '../utils/sampleData';
import { saveState, loadState } from '../utils/storage';

interface IndexData {
  item: string;
  p0: number;  // base price
  q0: number;  // base quantity
  p1: number;  // current price
  q1: number;  // current quantity
}

type IndexMethod = 'simple-aggregative' | 'simple-average' | 'laspeyres' | 'paasche' | 'marshall-edgeworth' | 'fisher';

const IndexNumbers: React.FC = () => {
  const [data, setData] = useState<IndexData[]>([]);
  const [method, setMethod] = useState<IndexMethod>('laspeyres');
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    const savedData = loadState('indexNumbersData');
    if (savedData) {
      setData(savedData);
    }
  }, []);

  useEffect(() => {
    saveState('indexNumbersData', data);
    if (data.length > 0) {
      calculateIndex();
    }
  }, [data, method]);

  const calculateIndex = () => {
    if (data.length === 0) return;

    const p0q0 = data.map(d => d.p0 * d.q0);
    const p1q0 = data.map(d => d.p1 * d.q0);
    const p0q1 = data.map(d => d.p0 * d.q1);
    const p1q1 = data.map(d => d.p1 * d.q1);
    const priceRelatives = data.map(d => (d.p1 / d.p0) * 100);

    const sumP0Q0 = sum(p0q0);
    const sumP1Q0 = sum(p1q0);
    const sumP0Q1 = sum(p0q1);
    const sumP1Q1 = sum(p1q1);
    const sumP0 = sum(data.map(d => d.p0));
    const sumP1 = sum(data.map(d => d.p1));

    let indexValue = 0;
    let formula = '';
    let calculation = '';

    switch (method) {
      case 'simple-aggregative':
        indexValue = (sumP1 / sumP0) * 100;
        formula = '(ΣP1 / ΣP0) × 100';
        calculation = `(${sumP1} / ${sumP0}) × 100`;
        break;
        
      case 'simple-average':
        indexValue = sum(priceRelatives) / priceRelatives.length;
        formula = 'Σ(P1/P0 × 100) / n';
        calculation = `${round(sum(priceRelatives))} / ${priceRelatives.length}`;
        break;
        
      case 'laspeyres':
        indexValue = (sumP1Q0 / sumP0Q0) * 100;
        formula = '(ΣP1Q0 / ΣP0Q0) × 100';
        calculation = `(${sumP1Q0} / ${sumP0Q0}) × 100`;
        break;
        
      case 'paasche':
        indexValue = (sumP1Q1 / sumP0Q1) * 100;
        formula = '(ΣP1Q1 / ΣP0Q1) × 100';
        calculation = `(${sumP1Q1} / ${sumP0Q1}) × 100`;
        break;
        
      case 'marshall-edgeworth':
        const sumP1Q0Q1 = sum(data.map(d => d.p1 * (d.q0 + d.q1)));
        const sumP0Q0Q1 = sum(data.map(d => d.p0 * (d.q0 + d.q1)));
        indexValue = (sumP1Q0Q1 / sumP0Q0Q1) * 100;
        formula = '[ΣP1(Q0+Q1) / ΣP0(Q0+Q1)] × 100';
        calculation = `(${sumP1Q0Q1} / ${sumP0Q0Q1}) × 100`;
        break;
        
      case 'fisher':
        const laspeyres = (sumP1Q0 / sumP0Q0) * 100;
        const paasche = (sumP1Q1 / sumP0Q1) * 100;
        indexValue = Math.sqrt(laspeyres * paasche);
        formula = '√(Laspeyres × Paasche)';
        calculation = `√(${round(laspeyres)} × ${round(paasche)})`;
        break;
    }

    // Test consistency for Fisher
    let timeReversalTest = null;
    let factorReversalTest = null;
    
    if (method === 'fisher') {
      // Time Reversal Test: P01 × P10 should equal 1
      const fisherReverse = Math.sqrt((sumP0Q1 / sumP1Q1) * (sumP0Q0 / sumP1Q0)) * 100;
      timeReversalTest = {
        passes: Math.abs((indexValue / 100) * (fisherReverse / 100) - 1) < 0.01,
        calculation: `${round(indexValue/100)} × ${round(fisherReverse/100)} = ${round((indexValue/100) * (fisherReverse/100))}`
      };

      // Factor Reversal Test: Price Index × Quantity Index should equal Value Index
      const quantityIndexFisher = Math.sqrt((sumP0Q1 / sumP0Q0) * (sumP1Q1 / sumP1Q0)) * 100;
      const valueIndex = (sumP1Q1 / sumP0Q0) * 100;
      factorReversalTest = {
        passes: Math.abs((indexValue / 100) * (quantityIndexFisher / 100) - (valueIndex / 100)) < 0.01,
        calculation: `${round(indexValue/100)} × ${round(quantityIndexFisher/100)} = ${round((indexValue/100) * (quantityIndexFisher/100))}, Value Index = ${round(valueIndex/100)}`
      };
    }

    setResults({
      indexValue: round(indexValue, 2),
      formula,
      calculation,
      detailsTable: data.map((item, i) => ({
        item: item.item,
        p0: item.p0,
        q0: item.q0,
        p1: item.p1,
        q1: item.q1,
        p0q0: round(p0q0[i]),
        p1q0: round(p1q0[i]),
        p0q1: round(p0q1[i]),
        p1q1: round(p1q1[i]),
        priceRelative: round(priceRelatives[i])
      })),
      totals: {
        sumP0,
        sumP1,
        sumP0Q0: round(sumP0Q0),
        sumP1Q0: round(sumP1Q0),
        sumP0Q1: round(sumP0Q1),
        sumP1Q1: round(sumP1Q1),
        avgPriceRelative: round(sum(priceRelatives) / priceRelatives.length)
      },
      timeReversalTest,
      factorReversalTest
    });
  };

  const getSteps = () => {
    if (!results) return [];
    
    const steps = [
      {
        title: 'Calculate Required Products',
        formula: 'P0Q0, P1Q0, P0Q1, P1Q1 for each item',
        calculation: 'See detailed table below',
        result: 'Products calculated for each item'
      },
      {
        title: 'Sum All Products',
        formula: 'ΣP0Q0, ΣP1Q0, ΣP0Q1, ΣP1Q1',
        calculation: `ΣP0Q0=${results.totals.sumP0Q0}, ΣP1Q0=${results.totals.sumP1Q0}, ΣP0Q1=${results.totals.sumP0Q1}, ΣP1Q1=${results.totals.sumP1Q1}`,
        result: 'All sums calculated'
      },
      {
        title: 'Apply Selected Method Formula',
        formula: results.formula,
        calculation: results.calculation,
        result: `Index = ${results.indexValue}`
      }
    ];

    if (results.timeReversalTest) {
      steps.push({
        title: 'Time Reversal Test',
        formula: 'P01 × P10 = 1',
        calculation: results.timeReversalTest.calculation,
        result: `Test ${results.timeReversalTest.passes ? 'PASSED ✓' : 'FAILED ✗'}`
      });
    }

    if (results.factorReversalTest) {
      steps.push({
        title: 'Factor Reversal Test',
        formula: 'P × Q = V',
        calculation: results.factorReversalTest.calculation,
        result: `Test ${results.factorReversalTest.passes ? 'PASSED ✓' : 'FAILED ✗'}`
      });
    }

    return steps;
  };

  const getChartData = () => {
    if (!results || !data.length) return [];
    
    return results.detailsTable.map((item: any) => ({
      item: item.item,
      basePrice: item.p0,
      currentPrice: item.p1,
      priceRelative: item.priceRelative
    }));
  };

  const loadSampleData = () => {
    setData(indexNumbersSampleData);
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
              Index numbers measure relative changes in prices, quantities, or values over time.
              They express changes as percentages relative to a base period, providing a standardized way to compare economic indicators.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Key Formulas</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Simple Methods:</h5>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• <strong>Simple Aggregative:</strong> (ΣP1 / ΣP0) × 100</li>
                  <li>• <strong>Simple Average:</strong> Σ(P1/P0 × 100) / n</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Weighted Methods:</h5>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• <strong>Laspeyres:</strong> (ΣP1Q0 / ΣP0Q0) × 100</li>
                  <li>• <strong>Paasche:</strong> (ΣP1Q1 / ΣP0Q1) × 100</li>
                  <li>• <strong>Fisher's Ideal:</strong> √(Laspeyres × Paasche)</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Properties & Tests</h4>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
              <li>• <strong>Time Reversal Test:</strong> P01 × P10 = 1 (Fisher passes)</li>
              <li>• <strong>Factor Reversal Test:</strong> Price Index × Quantity Index = Value Index</li>
              <li>• <strong>Circular Test:</strong> P01 × P12 × P20 = 1</li>
              <li>• <strong>Unit Test:</strong> Index should be 100 for base period</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Worked Example</h4>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400 mb-2">Items with base year (2020) and current year (2024) data:</p>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600 text-sm">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-600">
                      <th className="border border-gray-300 dark:border-gray-600 p-2">Item</th>
                      <th className="border border-gray-300 dark:border-gray-600 p-2">P0</th>
                      <th className="border border-gray-300 dark:border-gray-600 p-2">Q0</th>
                      <th className="border border-gray-300 dark:border-gray-600 p-2">P1</th>
                      <th className="border border-gray-300 dark:border-gray-600 p-2">Q1</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-600 p-2">A</td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2">10</td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2">100</td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2">12</td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2">105</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Laspeyres = (12×100)/(10×100) × 100 = 120</p>
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
              <li><strong>Consumer Price Index (CPI):</strong> Measure inflation and cost of living</li>
              <li><strong>Producer Price Index (PPI):</strong> Track input cost changes for businesses</li>
              <li><strong>Stock Market Indices:</strong> Monitor market performance (S&P 500, NASDAQ)</li>
              <li><strong>Economic Indicators:</strong> GDP deflators, wage indices</li>
              <li><strong>Business Analytics:</strong> Price trend analysis, competitive pricing</li>
              <li><strong>Government Policy:</strong> Monetary policy decisions, social security adjustments</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
              💡 Business Understanding
            </h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li><strong>Index &gt; 100:</strong> Prices increased since base period</li>
              <li><strong>Index &lt; 100:</strong> Prices decreased since base period</li>
              <li><strong>Laspeyres vs Paasche:</strong> Base vs current quantity weighting</li>
              <li><strong>Fisher's Ideal:</strong> Geometric mean, satisfies both consistency tests</li>
              <li><strong>High volatility:</strong> Unstable pricing environment</li>
              <li><strong>Consistent trends:</strong> Predictable market conditions</li>
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
        <p className="mb-4">Calculate Laspeyres and Paasche indices for:</p>
        
        <table className="w-full border-collapse border mb-4">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="border p-2">Item</th>
              <th className="border p-2">P0</th>
              <th className="border p-2">Q0</th>
              <th className="border p-2">P1</th>
              <th className="border p-2">Q1</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">X</td>
              <td className="border p-2">5</td>
              <td className="border p-2">20</td>
              <td className="border p-2">8</td>
              <td className="border p-2">25</td>
            </tr>
            <tr>
              <td className="border p-2">Y</td>
              <td className="border p-2">10</td>
              <td className="border p-2">15</td>
              <td className="border p-2">12</td>
              <td className="border p-2">18</td>
            </tr>
          </tbody>
        </table>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Laspeyres Index:</label>
            <input 
              type="number" 
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
              placeholder="Enter Laspeyres value"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Paasche Index:</label>
            <input 
              type="number" 
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
              placeholder="Enter Paasche value"
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
            <p><strong>Step 1:</strong> Calculate products</p>
            <p>P0Q0: (5×20) + (10×15) = 100 + 150 = 250</p>
            <p>P1Q0: (8×20) + (12×15) = 160 + 180 = 340</p>
            <p>P0Q1: (5×25) + (10×18) = 125 + 180 = 305</p>
            <p>P1Q1: (8×25) + (12×18) = 200 + 216 = 416</p>
            <p><strong>Step 2:</strong> Calculate indices</p>
            <p>Laspeyres = (340/250) × 100 = 136</p>
            <p>Paasche = (416/305) × 100 = 136.39</p>
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
              { key: 'item', label: 'Item', type: 'text' },
              { key: 'p0', label: 'P0 (Base Price)', type: 'number' },
              { key: 'q0', label: 'Q0 (Base Qty)', type: 'number' },
              { key: 'p1', label: 'P1 (Current Price)', type: 'number' },
              { key: 'q1', label: 'Q1 (Current Qty)', type: 'number' }
            ]}
            onChange={setData}
            onLoadSample={loadSampleData}
          />
        </div>
        
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4">Index Method</h3>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as IndexMethod)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
            >
              <option value="simple-aggregative">Simple Aggregative</option>
              <option value="simple-average">Simple Average</option>
              <option value="laspeyres">Laspeyres</option>
              <option value="paasche">Paasche</option>
              <option value="marshall-edgeworth">Marshall-Edgeworth</option>
              <option value="fisher">Fisher's Ideal</option>
            </select>
          </div>
          
          {results && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Result</h3>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {results.indexValue}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {results.formula}
              </div>
              
              {results.timeReversalTest && (
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm">
                    <div className={`flex items-center space-x-2 ${results.timeReversalTest.passes ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{results.timeReversalTest.passes ? '✓' : '✗'}</span>
                      <span>Time Reversal Test</span>
                    </div>
                    <div className={`flex items-center space-x-2 mt-1 ${results.factorReversalTest?.passes ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{results.factorReversalTest?.passes ? '✓' : '✗'}</span>
                      <span>Factor Reversal Test</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {results && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4">Price Comparison Chart</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="item" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="basePrice" fill="#8884d8" name="Base Price" />
                <Bar dataKey="currentPrice" fill="#82ca9d" name="Current Price" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <StepBox title="Step-by-Step Calculations" steps={getSteps()} />
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4">Detailed Calculations Table</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200 dark:border-gray-600">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="border border-gray-200 dark:border-gray-600 p-2">Item</th>
                    <th className="border border-gray-200 dark:border-gray-600 p-2">P0</th>
                    <th className="border border-gray-200 dark:border-gray-600 p-2">Q0</th>
                    <th className="border border-gray-200 dark:border-gray-600 p-2">P1</th>
                    <th className="border border-gray-200 dark:border-gray-600 p-2">Q1</th>
                    <th className="border border-gray-200 dark:border-gray-600 p-2">P0Q0</th>
                    <th className="border border-gray-200 dark:border-gray-600 p-2">P1Q0</th>
                    <th className="border border-gray-200 dark:border-gray-600 p-2">P0Q1</th>
                    <th className="border border-gray-200 dark:border-gray-600 p-2">P1Q1</th>
                    <th className="border border-gray-200 dark:border-gray-600 p-2">Price Relative</th>
                  </tr>
                </thead>
                <tbody>
                  {results.detailsTable.map((row: any, index: number) => (
                    <tr key={index}>
                      <td className="border border-gray-200 dark:border-gray-600 p-2">{row.item}</td>
                      <td className="border border-gray-200 dark:border-gray-600 p-2">{row.p0}</td>
                      <td className="border border-gray-200 dark:border-gray-600 p-2">{row.q0}</td>
                      <td className="border border-gray-200 dark:border-gray-600 p-2">{row.p1}</td>
                      <td className="border border-gray-200 dark:border-gray-600 p-2">{row.q1}</td>
                      <td className="border border-gray-200 dark:border-gray-600 p-2">{row.p0q0}</td>
                      <td className="border border-gray-200 dark:border-gray-600 p-2">{row.p1q0}</td>
                      <td className="border border-gray-200 dark:border-gray-600 p-2">{row.p0q1}</td>
                      <td className="border border-gray-200 dark:border-gray-600 p-2">{row.p1q1}</td>
                      <td className="border border-gray-200 dark:border-gray-600 p-2">{row.priceRelative}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 dark:bg-gray-700 font-semibold">
                    <td className="border border-gray-200 dark:border-gray-600 p-2">TOTAL</td>
                    <td className="border border-gray-200 dark:border-gray-600 p-2">{results.totals.sumP0}</td>
                    <td className="border border-gray-200 dark:border-gray-600 p-2">-</td>
                    <td className="border border-gray-200 dark:border-gray-600 p-2">{results.totals.sumP1}</td>
                    <td className="border border-gray-200 dark:border-gray-600 p-2">-</td>
                    <td className="border border-gray-200 dark:border-gray-600 p-2">{results.totals.sumP0Q0}</td>
                    <td className="border border-gray-200 dark:border-gray-600 p-2">{results.totals.sumP1Q0}</td>
                    <td className="border border-gray-200 dark:border-gray-600 p-2">{results.totals.sumP0Q1}</td>
                    <td className="border border-gray-200 dark:border-gray-600 p-2">{results.totals.sumP1Q1}</td>
                    <td className="border border-gray-200 dark:border-gray-600 p-2">{results.totals.avgPriceRelative}</td>
                  </tr>
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
          Index Numbers
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Calculate price indices using various methods with consistency tests
        </p>
      </div>
      
      <TabsContainer tabs={tabs} defaultTab="simulator" />
    </div>
  );
};

export default IndexNumbers;