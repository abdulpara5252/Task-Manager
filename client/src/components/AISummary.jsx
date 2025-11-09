import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_URL from '../config/api';

const AISummary = ({ boardId }) => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleGenerateSummary = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/ai/summary`, { boardId });
      setSummary(response.data);
      setShowModal(true);
      toast.success('🧠 Summary generated!');
    } catch (error) {
      toast.error('Failed to generate summary');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleGenerateSummary}
        disabled={loading}
        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md transition-all"
      >
        {loading ? '⏳ Generating...' : '🧠 AI Summarize Board'}
      </button>

      {/* Modal */}
      {showModal && summary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-gray-800">🧠 AI Board Summary</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">{summary.stats.totalCards}</div>
                <div className="text-sm text-gray-600">Total Cards</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-600">{summary.stats.totalSubtasks}</div>
                <div className="text-sm text-gray-600">Total Subtasks</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-600">{summary.stats.completedSubtasks}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-orange-600">{summary.stats.completionRate}%</div>
                <div className="text-sm text-gray-600">Progress</div>
              </div>
            </div>

            {/* AI Summary */}
            <div className="bg-primary-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-800 mb-2">AI Insights:</h4>
              <p className="text-gray-700 leading-relaxed">{summary.summary}</p>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AISummary;
