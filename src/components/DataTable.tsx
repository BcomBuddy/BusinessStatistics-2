import React from 'react';
import { Plus, Trash2, Download } from 'lucide-react';

interface DataTableProps {
  data: any[];
  columns: { key: string; label: string; type?: string }[];
  onChange: (data: any[]) => void;
  onLoadSample?: () => void;
}

const DataTable: React.FC<DataTableProps> = ({ 
  data, 
  columns, 
  onChange, 
  onLoadSample 
}) => {
  const addRow = () => {
    const newRow = columns.reduce((acc, col) => {
      acc[col.key] = '';
      return acc;
    }, {} as any);
    onChange([...data, newRow]);
  };

  const removeRow = (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    onChange(newData);
  };

  const updateCell = (rowIndex: number, key: string, value: string) => {
    const newData = [...data];
    const col = columns.find(c => c.key === key);
    newData[rowIndex][key] = col?.type === 'number' ? (value === '' ? '' : parseFloat(value) || 0) : value;
    onChange(newData);
  };

  const clearData = () => {
    onChange([]);
  };

  const downloadCSV = () => {
    const csvContent = [
      columns.map(col => col.label).join(','),
      ...data.map(row => columns.map(col => row[col.key]).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePasteCSV = (event: React.ClipboardEvent) => {
    event.preventDefault();
    const pastedData = event.clipboardData.getData('text');
    const rows = pastedData.trim().split('\n');
    
    if (rows.length > 1) {
      const hasHeaders = isNaN(parseFloat(rows[0].split(',')[0]));
      const dataRows = hasHeaders ? rows.slice(1) : rows;
      
      const parsedData = dataRows.map(row => {
        const values = row.split(',');
        return columns.reduce((acc, col, index) => {
          const value = values[index]?.trim() || '';
          acc[col.key] = col.type === 'number' ? parseFloat(value) || 0 : value;
          return acc;
        }, {} as any);
      });
      
      onChange(parsedData);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Data Table
          </h3>
          <div className="flex space-x-2">
            {onLoadSample && (
              <button
                onClick={onLoadSample}
                className="px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Load Sample
              </button>
            )}
            <button
              onClick={downloadCSV}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              title="Download CSV"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={addRow}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Add Row"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={clearData}
              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              title="Clear All"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Tip: Paste CSV data (Ctrl+V) or click "Add Row" to input data manually
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                  >
                    {col.label}
                  </th>
                ))}
                <th className="px-4 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                  Action
                </th>
              </tr>
            </thead>
            <tbody onPaste={handlePasteCSV}>
              {data.length === 0 ? (
                <tr>
                  <td 
                    colSpan={columns.length + 1}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600"
                  >
                    No data entered. Click "Add Row" or paste CSV data.
                  </td>
                </tr>
              ) : (
                data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-4 py-2 border border-gray-200 dark:border-gray-600"
                      >
                        <input
                          type={col.type === 'number' ? 'number' : 'text'}
                          value={row[col.key]}
                          onChange={(e) => updateCell(rowIndex, col.key, e.target.value)}
                          className="w-full px-2 py-1 text-sm bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                          step={col.type === 'number' ? '0.01' : undefined}
                         placeholder={col.type === 'number' ? '' : ''}
                        />
                      </td>
                    ))}
                    <td className="px-4 py-2 text-center border border-gray-200 dark:border-gray-600">
                      <button
                        onClick={() => removeRow(rowIndex)}
                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        title="Remove Row"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataTable;