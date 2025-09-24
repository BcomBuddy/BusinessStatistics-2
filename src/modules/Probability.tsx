import React, { useState, useEffect } from 'react';
import StepBox from '../components/StepBox';
import TabsContainer from '../components/TabsContainer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { round, factorial, combination, permutation } from '../utils/math';
import { saveState, loadState } from '../utils/storage';

interface BayesData {
  hypothesis: string;
  prior: number;
  likelihood: number;
}

interface MonteCarloResult {
  trial: number;
  outcome: number;
  runningAverage: number;
}

const Probability: React.FC = () => {
  const [calculatorType, setCalculatorType] = useState<'permutation' | 'combination' | 'bayes' | 'monte-carlo'>('permutation');
  
  // Permutation/Combination inputs
  const [n, setN] = useState<string>('10');
  const [r, setR] = useState<string>('3');
  
  // Bayes inputs
  const [bayesData, setBayesData] = useState<BayesData[]>([
    { hypothesis: 'H1', prior: 0.3, likelihood: 0.8 },
    { hypothesis: 'H2', prior: 0.5, likelihood: 0.6 },
    { hypothesis: 'H3', prior: 0.2, likelihood: 0.9 }
  ]);
  
  // Monte Carlo inputs
  const [mcTrials, setMcTrials] = useState<string>('1000');
  const [mcType, setMcType] = useState<'coin' | 'die' | 'two-dice'>('coin');
  const [mcResults, setMcResults] = useState<MonteCarloResult[]>([]);
  
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    const savedData = loadState('probabilityData');
    if (savedData) {
      setBayesData(savedData.bayesData || bayesData);
      setN(savedData.n || '10');
      setR(savedData.r || '3');
      setMcTrials(savedData.mcTrials || '1000');
      setMcType(savedData.mcType || 'coin');
    }
  }, []);

  useEffect(() => {
    saveState('probabilityData', { bayesData, n, r, mcTrials, mcType });
    calculateResults();
  }, [calculatorType, n, r, bayesData, mcTrials, mcType]);

  const calculateResults = () => {
    let newResults: any = {};

    switch (calculatorType) {
      case 'permutation':
        const nVal = parseInt(n) || 0;
        const rVal = parseInt(r) || 0;
        if (nVal >= 0 && rVal >= 0 && rVal <= nVal && nVal <= 200) {
          const pResult = permutation(nVal, rVal);
          newResults = {
            type: 'permutation',
            value: pResult,
            formula: `P(${nVal}, ${rVal}) = ${nVal}! / (${nVal} - ${rVal})!`,
            calculation: `${nVal}! / ${nVal - rVal}! = ${factorial(nVal)} / ${factorial(nVal - rVal)}`,
            steps: [
              {
                title: 'Permutation Formula',
                formula: 'P(n, r) = n! / (n - r)!',
                calculation: `P(${nVal}, ${rVal}) = ${nVal}! / (${nVal} - ${rVal})!`,
                result: `Formula applied`
              },
              {
                title: 'Calculate Factorials',
                formula: `${nVal}! and (${nVal} - ${rVal})!`,
                calculation: `${nVal}! = ${factorial(nVal)}, (${nVal} - ${rVal})! = ${factorial(nVal - rVal)}`,
                result: `Factorials calculated`
              },
              {
                title: 'Final Division',
                formula: `${factorial(nVal)} / ${factorial(nVal - rVal)}`,
                calculation: `${factorial(nVal)} / ${factorial(nVal - rVal)} = ${pResult}`,
                result: `P(${nVal}, ${rVal}) = ${pResult}`
              }
            ]
          };
        }
        break;
        
      case 'combination':
        const nValC = parseInt(n) || 0;
        const rValC = parseInt(r) || 0;
        if (nValC >= 0 && rValC >= 0 && rValC <= nValC && nValC <= 200) {
          const cResult = combination(nValC, rValC);
          newResults = {
            type: 'combination',
            value: cResult,
            formula: `C(${nValC}, ${rValC}) = ${nValC}! / (${rValC}! × (${nValC} - ${rValC})!)`,
            calculation: `${nValC}! / (${rValC}! × ${nValC - rValC}!) = ${factorial(nValC)} / (${factorial(rValC)} × ${factorial(nValC - rValC)})`,
            steps: [
              {
                title: 'Combination Formula',
                formula: 'C(n, r) = n! / (r! × (n - r)!)',
                calculation: `C(${nValC}, ${rValC}) = ${nValC}! / (${rValC}! × (${nValC} - ${rValC})!)`,
                result: `Formula applied`
              },
              {
                title: 'Calculate Factorials',
                formula: `${nValC}!, ${rValC}!, and (${nValC} - ${rValC})!`,
                calculation: `${nValC}! = ${factorial(nValC)}, ${rValC}! = ${factorial(rValC)}, (${nValC} - ${rValC})! = ${factorial(nValC - rValC)}`,
                result: `All factorials calculated`
              },
              {
                title: 'Final Calculation',
                formula: `${factorial(nValC)} / (${factorial(rValC)} × ${factorial(nValC - rValC)})`,
                calculation: `${factorial(nValC)} / ${factorial(rValC) * factorial(nValC - rValC)} = ${cResult}`,
                result: `C(${nValC}, ${rValC}) = ${cResult}`
              }
            ]
          };
        }
        break;
        
      case 'bayes':
        const totalPrior = bayesData.reduce((sum, item) => sum + item.prior, 0);
        if (Math.abs(totalPrior - 1) < 0.001) {
          const marginalLikelihood = bayesData.reduce((sum, item) => sum + item.prior * item.likelihood, 0);
          const posteriors = bayesData.map(item => ({
            ...item,
            posterior: (item.prior * item.likelihood) / marginalLikelihood
          }));
          
          newResults = {
            type: 'bayes',
            posteriors,
            marginalLikelihood: round(marginalLikelihood, 4),
            steps: [
              {
                title: 'Calculate Marginal Likelihood',
                formula: 'P(E) = Σ P(Hi) × P(E|Hi)',
                calculation: bayesData.map(item => `${item.prior} × ${item.likelihood}`).join(' + '),
                result: `P(E) = ${round(marginalLikelihood, 4)}`
              },
              ...posteriors.map((item, i) => ({
                title: `Calculate P(${item.hypothesis}|E)`,
                formula: 'P(Hi|E) = P(Hi) × P(E|Hi) / P(E)',
                calculation: `(${item.prior} × ${item.likelihood}) / ${round(marginalLikelihood, 4)}`,
                result: `P(${item.hypothesis}|E) = ${round(item.posterior, 4)}`
              }))
            ]
          };
        }
        break;
        
      case 'monte-carlo':
        runMonteCarloSimulation();
        break;
    }

    setResults(newResults);
  };

  const runMonteCarloSimulation = () => {
    const results: MonteCarloResult[] = [];
    let successCount = 0;
    const trials = parseInt(mcTrials) || 1000;
    
    for (let i = 1; i <= trials; i++) {
      let outcome = 0;
      
      switch (mcType) {
        case 'coin':
          outcome = Math.random() < 0.5 ? 1 : 0; // 1 for heads
          break;
        case 'die':
          outcome = Math.floor(Math.random() * 6) + 1;
          break;
        case 'two-dice':
          const die1 = Math.floor(Math.random() * 6) + 1;
          const die2 = Math.floor(Math.random() * 6) + 1;
          outcome = die1 + die2;
          break;
      }
      
      if (mcType === 'coin' && outcome === 1) successCount++;
      if (mcType === 'die' && outcome === 6) successCount++;
      if (mcType === 'two-dice' && outcome === 7) successCount++;
      
      const runningAverage = successCount / i;
      
      if (i <= 100 || i % 10 === 0) {
        results.push({
          trial: i,
          outcome,
          runningAverage: round(runningAverage, 4)
        });
      }
    }
    
    setMcResults(results);
    
    const theoreticalProb = mcType === 'coin' ? 0.5 : mcType === 'die' ? 1/6 : 1/6;
    const finalEmpirical = successCount / trials;
    
    setResults({
      type: 'monte-carlo',
      empiricalProbability: round(finalEmpirical, 4),
      theoreticalProbability: round(theoreticalProb, 4),
      difference: round(Math.abs(finalEmpirical - theoreticalProb), 4),
      trials: trials,
      successes: successCount,
      chartData: results.filter((_, i) => i % Math.max(1, Math.floor(results.length / 50)) === 0)
    });
  };

  const updateBayesData = (index: number, field: keyof BayesData, value: string | number) => {
    const newData = [...bayesData];
    newData[index] = { ...newData[index], [field]: value };
    setBayesData(newData);
  };

  const addBayesHypothesis = () => {
    setBayesData([...bayesData, { hypothesis: `H${bayesData.length + 1}`, prior: 0.1, likelihood: 0.5 }]);
  };

  const removeBayesHypothesis = (index: number) => {
    if (bayesData.length > 2) {
      setBayesData(bayesData.filter((_, i) => i !== index));
    }
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
              Probability measures the likelihood of an event occurring, expressed as a number between 0 and 1.
              It provides a mathematical framework for quantifying uncertainty and making informed decisions.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Basic Definitions</h4>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
              <li>• <strong>Experiment:</strong> A process that yields an outcome</li>
              <li>• <strong>Sample Space (S):</strong> Set of all possible outcomes</li>
              <li>• <strong>Event (E):</strong> Subset of sample space</li>
              <li>• <strong>Mutually Exclusive:</strong> Events that cannot occur together</li>
              <li>• <strong>Independent:</strong> Events where one doesn't affect the other</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Key Formulas</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Counting Principles:</h5>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• <strong>Permutation:</strong> P(n,r) = n!/(n-r)!</li>
                  <li>• <strong>Combination:</strong> C(n,r) = n!/(r!(n-r)!)</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Probability Rules:</h5>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• <strong>Addition Rule:</strong> P(A ∪ B) = P(A) + P(B) - P(A ∩ B)</li>
                  <li>• <strong>Multiplication Rule:</strong> P(A ∩ B) = P(A) × P(B|A)</li>
                  <li>• <strong>Conditional Probability:</strong> P(A|B) = P(A ∩ B) / P(B)</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Bayes' Theorem</h4>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400 mb-2">P(H|E) = P(H) × P(E|H) / P(E)</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Where P(E) = Σ P(Hi) × P(E|Hi)</p>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">This theorem allows us to update our beliefs about hypotheses based on new evidence.</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Worked Example</h4>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400 mb-2">How many ways can we arrange 5 people in a row?</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Answer: P(5,5) = 5! = 5 × 4 × 3 × 2 × 1 = 120 ways</p>
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
              <li><strong>Risk Assessment:</strong> Calculate insurance premiums and credit risk</li>
              <li><strong>Quality Control:</strong> Determine acceptable defect rates in manufacturing</li>
              <li><strong>Marketing Strategy:</strong> Optimize campaign targeting and conversion rates</li>
              <li><strong>Investment Decisions:</strong> Evaluate portfolio risk and expected returns</li>
              <li><strong>Healthcare:</strong> Medical diagnosis and treatment effectiveness</li>
              <li><strong>Gaming & Entertainment:</strong> Casino games, lottery systems</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
              💡 Business Understanding
            </h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li><strong>P = 0:</strong> Impossible event (e.g., negative profit)</li>
              <li><strong>P = 1:</strong> Certain event (e.g., positive revenue)</li>
              <li><strong>P &lt; 0.05:</strong> Statistically significant, reject null hypothesis</li>
              <li><strong>P &gt; 0.8:</strong> High confidence, reliable predictions</li>
              <li><strong>Independent Events:</strong> No correlation, separate analysis needed</li>
              <li><strong>Conditional Probability:</strong> Update beliefs with new information</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const practiceContent = (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Practice Problems</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-2">Problem 1: Permutations</h4>
            <p className="mb-2">In how many ways can 8 books be arranged on a shelf if 3 specific books must be together?</p>
            <input 
              type="number"
              className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
              placeholder="Answer"
            />
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Problem 2: Combinations</h4>
            <p className="mb-2">A committee of 4 people is to be formed from 10 people. How many ways?</p>
            <input 
              type="number"
              className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
              placeholder="Answer"
            />
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Problem 3: Conditional Probability</h4>
            <p className="mb-2">P(A) = 0.6, P(B) = 0.4, P(A ∩ B) = 0.2. Find P(A|B).</p>
            <input 
              type="number"
              step="0.01"
              className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
              placeholder="Answer"
            />
          </div>
          
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Check Answers
          </button>
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <details className="text-sm">
          <summary className="cursor-pointer text-blue-600 dark:text-blue-400 font-semibold">Show Solutions</summary>
          <div className="mt-2 space-y-2">
            <p><strong>Problem 1:</strong> Treat 3 books as one unit: 6! × 3! = 4,320</p>
            <p><strong>Problem 2:</strong> C(10,4) = 10!/(4!×6!) = 210</p>
            <p><strong>Problem 3:</strong> P(A|B) = P(A∩B)/P(B) = 0.2/0.4 = 0.5</p>
          </div>
        </details>
      </div>
    </div>
  );

  const simulatorContent = (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Probability Calculator</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => setCalculatorType('permutation')}
            className={`px-4 py-2 rounded-md ${calculatorType === 'permutation' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Permutation
          </button>
          <button
            onClick={() => setCalculatorType('combination')}
            className={`px-4 py-2 rounded-md ${calculatorType === 'combination' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Combination
          </button>
          <button
            onClick={() => setCalculatorType('bayes')}
            className={`px-4 py-2 rounded-md ${calculatorType === 'bayes' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Bayes' Theorem
          </button>
          <button
            onClick={() => setCalculatorType('monte-carlo')}
            className={`px-4 py-2 rounded-md ${calculatorType === 'monte-carlo' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Monte Carlo
          </button>
        </div>
        
        {calculatorType === 'permutation' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">n (total items):</label>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={n}
                  onChange={(e) => setN(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">r (items to arrange):</label>
                <input
                  type="number"
                  min="0"
                  max={parseInt(n) || 0}
                  value={r}
                  onChange={(e) => setR(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                />
              </div>
            </div>
            {results && results.type === 'permutation' && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Result</h4>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {results.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {results.formula}
                </div>
              </div>
            )}
          </div>
        )}
        
        {calculatorType === 'combination' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">n (total items):</label>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={n}
                  onChange={(e) => setN(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">r (items to choose):</label>
                <input
                  type="number"
                  min="0"
                  max={parseInt(n) || 0}
                  value={r}
                  onChange={(e) => setR(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                />
              </div>
            </div>
            {results && results.type === 'combination' && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Result</h4>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {results.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {results.formula}
                </div>
              </div>
            )}
          </div>
        )}
        
        {calculatorType === 'bayes' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Hypotheses and Probabilities</h4>
              <button
                onClick={addBayesHypothesis}
                className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
              >
                Add Hypothesis
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200 dark:border-gray-600">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="border border-gray-200 dark:border-gray-600 p-2">Hypothesis</th>
                    <th className="border border-gray-200 dark:border-gray-600 p-2">Prior P(H)</th>
                    <th className="border border-gray-200 dark:border-gray-600 p-2">Likelihood P(E|H)</th>
                    <th className="border border-gray-200 dark:border-gray-600 p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bayesData.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-gray-200 dark:border-gray-600 p-2">
                        <input
                          type="text"
                          value={item.hypothesis}
                          onChange={(e) => updateBayesData(index, 'hypothesis', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                        />
                      </td>
                      <td className="border border-gray-200 dark:border-gray-600 p-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          value={item.prior}
                          onChange={(e) => updateBayesData(index, 'prior', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                        />
                      </td>
                      <td className="border border-gray-200 dark:border-gray-600 p-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          value={item.likelihood}
                          onChange={(e) => updateBayesData(index, 'likelihood', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                        />
                      </td>
                      <td className="border border-gray-200 dark:border-gray-600 p-2">
                        {bayesData.length > 2 && (
                          <button
                            onClick={() => removeBayesHypothesis(index)}
                            className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {results && results.type === 'bayes' && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Posterior Probabilities</h4>
                <div className="space-y-2">
                  {results.posteriors.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between">
                      <span>P({item.hypothesis}|E):</span>
                      <span className="font-mono">{round(item.posterior, 4)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {calculatorType === 'monte-carlo' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Experiment Type:</label>
                <select
                  value={mcType}
                  onChange={(e) => setMcType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                >
                  <option value="coin">Coin Flip (Heads)</option>
                  <option value="die">Die Roll (Getting 6)</option>
                  <option value="two-dice">Two Dice (Sum = 7)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Number of Trials:</label>
                <input
                  type="number"
                  min="100"
                  max="10000"
                  value={mcTrials}
                  onChange={(e) => setMcTrials(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                />
              </div>
              <button
                onClick={runMonteCarloSimulation}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Run Simulation
              </button>
            </div>
            
            {results && results.type === 'monte-carlo' && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Simulation Results</h4>
                <div className="space-y-2 text-sm">
                  <div>Trials: {results.trials}</div>
                  <div>Successes: {results.successes}</div>
                  <div>Empirical Probability: {results.empiricalProbability}</div>
                  <div>Theoretical Probability: {results.theoreticalProbability}</div>
                  <div>Difference: {results.difference}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {results && results.steps && (
        <StepBox title="Step-by-Step Calculation" steps={results.steps} />
      )}
      
      {results && results.type === 'monte-carlo' && results.chartData && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">Probability Convergence</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={results.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="trial" />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Legend />
              <Line 
                dataKey="runningAverage" 
                stroke="#3B82F6" 
                strokeWidth={2} 
                name="Empirical Probability" 
                dot={false}
              />
              <Line 
                dataKey={() => results.theoreticalProbability} 
                stroke="#EF4444" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                name="Theoretical Probability" 
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
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
          Probability
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Learn permutations, combinations, conditional probability, and Bayes' theorem
        </p>
      </div>
      
      <TabsContainer tabs={tabs} defaultTab="simulator" />
    </div>
  );
};

export default Probability;