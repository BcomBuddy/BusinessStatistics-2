import React from 'react';

interface Step {
  title: string;
  formula?: string;
  calculation?: string;
  result?: string | number;
  note?: string;
}

interface StepBoxProps {
  title: string;
  steps: Step[];
}

const StepBox: React.FC<StepBoxProps> = ({ title, steps }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        {title}
      </h3>
      
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="border-l-4 border-blue-500 pl-4">
            <div className="font-medium text-gray-800 dark:text-white mb-2">
              {index + 1}. {step.title}
            </div>
            
            {step.formula && (
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                <strong>Formula:</strong> <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{step.formula}</code>
              </div>
            )}
            
            {step.calculation && (
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                <strong>Calculation:</strong> <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{step.calculation}</code>
              </div>
            )}
            
            {step.result !== undefined && (
              <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                <strong>Result:</strong> {step.result}
              </div>
            )}
            
            {step.note && (
              <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                Note: {step.note}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepBox;