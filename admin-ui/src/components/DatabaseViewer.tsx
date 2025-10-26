import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Database, Table, Search, Play, RefreshCw } from 'lucide-react';

interface TableInfo {
  name: string;
  columns: number;
  rows: number;
}

interface TableData {
  columns: string[];
  rows: any[][];
  total_count: number;
}

export const DatabaseViewer: React.FC = () => {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [loading, setLoading] = useState(false);
  const [queryMode, setQueryMode] = useState(false);
  const [query, setQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [page, setPage] = useState(0);
  const limit = 50;

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      fetchTableData(selectedTable, page);
    }
  }, [selectedTable, page]);

  const fetchTables = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://139.59.22.121:8000/database/tables', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTables(response.data);
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    }
  };

  const fetchTableData = async (tableName: string, currentPage: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        `http://139.59.22.121:8000/database/tables/${tableName}/data?limit=${limit}&offset=${currentPage * limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTableData(response.data);
    } catch (error) {
      console.error('Failed to fetch table data:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeQuery = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        'http://139.59.22.121:8000/database/query',
        { query },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQueryResult(response.data);
      setSelectedTable(null);
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Query execution failed');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = tableData ? Math.ceil(tableData.total_count / limit) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Database Viewer</h1>
          <p className="text-sm text-slate-400">PostgreSQL Database Explorer</p>
        </div>
        <button
          onClick={() => setQueryMode(!queryMode)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            queryMode
              ? 'bg-brand-green text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Play className="w-4 h-4" />
          {queryMode ? 'Table View' : 'Query Mode'}
        </button>
      </div>

      {queryMode ? (
        <div className="space-y-4">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <label className="block text-sm font-medium text-slate-300 mb-2">SQL Query (SELECT only)</label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SELECT * FROM users LIMIT 10;"
              className="w-full h-32 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-brand-green"
            />
            <button
              onClick={executeQuery}
              disabled={loading}
              className="mt-3 flex items-center gap-2 px-4 py-2 bg-brand-green hover:bg-brand-green disabled:bg-slate-600 text-white rounded-lg transition-colors"
            >
              <Play className="w-4 h-4" />
              {loading ? 'Executing...' : 'Execute Query'}
            </button>
          </div>

          {queryResult && (
            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              <div className="p-4 bg-slate-900 border-b border-slate-700">
                <p className="text-sm text-slate-400">Results: {queryResult.row_count} rows</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-900 border-b border-slate-700">
                    <tr>
                      {queryResult.columns.map((col: string, idx: number) => (
                        <th key={idx} className="px-4 py-3 text-left text-brand-green font-medium">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResult.rows.map((row: any[], rowIdx: number) => (
                      <tr key={rowIdx} className="border-b border-slate-700 hover:bg-slate-700/50">
                        {row.map((cell: any, cellIdx: number) => (
                          <td key={cellIdx} className="px-4 py-3 text-slate-300">
                            {cell === null ? <span className="text-slate-500 italic">null</span> : String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          {/* Tables List */}
          <div className="col-span-3 bg-slate-800 rounded-lg border border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-brand-green" />
              <h2 className="font-semibold text-white">Tables ({tables.length})</h2>
              <button onClick={fetchTables} className="ml-auto p-1 hover:bg-slate-700 rounded">
                <RefreshCw className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {tables.map((table) => (
                <button
                  key={table.name}
                  onClick={() => {
                    setSelectedTable(table.name);
                    setPage(0);
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedTable === table.name
                      ? 'bg-brand-green/20 border-brand-green text-brand-green'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Table className="w-4 h-4" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{table.name}</p>
                      <p className="text-xs text-slate-400">{table.rows} rows • {table.columns} cols</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Table Data */}
          <div className="col-span-9 bg-slate-800 rounded-lg border border-slate-700">
            {selectedTable ? (
              <>
                <div className="p-4 bg-slate-900 border-b border-slate-700 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-white text-lg">{selectedTable}</h2>
                    <p className="text-sm text-slate-400">
                      Showing {page * limit + 1}-{Math.min((page + 1) * limit, tableData?.total_count || 0)} of {tableData?.total_count || 0} rows
                    </p>
                  </div>
                </div>
                
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : tableData ? (
                  <>
                    <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-900 border-b border-slate-700 sticky top-0">
                          <tr>
                            {tableData.columns.map((col, idx) => (
                              <th key={idx} className="px-4 py-3 text-left text-brand-green font-medium whitespace-nowrap">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.rows.map((row, rowIdx) => (
                            <tr key={rowIdx} className="border-b border-slate-700 hover:bg-slate-700/50">
                              {row.map((cell, cellIdx) => (
                                <td key={cellIdx} className="px-4 py-3 text-slate-300 whitespace-nowrap">
                                  {cell === null ? <span className="text-slate-500 italic">null</span> : String(cell)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {totalPages > 1 && (
                      <div className="p-4 bg-slate-900 border-t border-slate-700 flex items-center justify-between">
                        <button
                          onClick={() => setPage(Math.max(0, page - 1))}
                          disabled={page === 0}
                          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg transition-colors"
                        >
                          Previous
                        </button>
                        <span className="text-sm text-slate-400">
                          Page {page + 1} of {totalPages}
                        </span>
                        <button
                          onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                          disabled={page >= totalPages - 1}
                          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                ) : null}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Search className="w-12 h-12 mb-3" />
                <p>Select a table to view data</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
