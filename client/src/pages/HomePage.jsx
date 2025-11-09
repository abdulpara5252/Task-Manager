import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBoards, createBoard, deleteBoard } from '../redux/actions/boardActions';
import { selectAllBoards, selectBoardsLoading } from '../redux/selectors/boardSelectors';
import toast from 'react-hot-toast';

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const boards = useSelector(selectAllBoards);
  const loading = useSelector(selectBoardsLoading);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    dispatch(fetchBoards());
  }, [dispatch]);

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (newBoardTitle.trim()) {
      try {
        const result = await dispatch(createBoard(newBoardTitle.trim())).unwrap();
        setNewBoardTitle('');
        setShowCreateForm(false);
        toast.success('Board created!');
        navigate(`/board/${result._id}`);
      } catch (error) {
        toast.error('Failed to create board');
      }
    }
  };

  const handleDeleteBoard = async (boardId, boardTitle) => {
    if (window.confirm(`Delete board "${boardTitle}"?`)) {
      try {
        await dispatch(deleteBoard(boardId)).unwrap();
        toast.success('Board deleted!');
      } catch (error) {
        toast.error('Failed to delete board');
      }
    }
  };

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-primary-600">
                AI Task Manager
              </h1>
              <p className="text-gray-600 mt-1">Organize your work with AI-powered insights</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium shadow-lg transition-all"
            >
              + Create New Board
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Create Board Form */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Create New Board</h3>
              <form onSubmit={handleCreateBoard}>
                <input
                  type="text"
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  placeholder="Enter board title..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium"
                  >
                    Create Board
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewBoardTitle('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Boards Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading boards...</p>
            </div>
          </div>
        ) : boards.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No boards yet</h3>
            <p className="text-gray-500 mb-6">Create your first board to get started!</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium"
            >
              Create Your First Board
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <div
                key={board.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 cursor-pointer border-2 border-transparent hover:border-primary-300"
                onClick={() => navigate(`/board/${board.id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 flex-1">{board.title}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBoard(board.id, board.title);
                    }}
                    className="text-gray-400 hover:text-red-500 ml-2"
                  >
                    🗑️
                  </button>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span>{board.lists?.length || 0} lists</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(board.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
