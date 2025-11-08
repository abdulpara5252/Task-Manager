import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBoard } from '../redux/actions/boardActions';
import { fetchListsByBoard } from '../redux/actions/listActions';
import { selectCurrentBoard } from '../redux/selectors/boardSelectors';
import { selectListsByBoard } from '../redux/selectors/listSelectors';
import Board from '../components/Board';
import toast from 'react-hot-toast';

const BoardPage = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const board = useSelector(selectCurrentBoard);
  const lists = useSelector(state => selectListsByBoard(state, boardId));

  useEffect(() => {
    const loadBoard = async () => {
      try {
        await dispatch(fetchBoard(boardId)).unwrap();
        await dispatch(fetchListsByBoard(boardId)).unwrap();
        
        const { fetchCardsByList } = await import('../redux/actions/cardActions');
        for (const list of lists) {
          dispatch(fetchCardsByList(list.id));
        }
      } catch (error) {
        toast.error('Failed to load board');
        navigate('/');
      }
    };

    if (boardId) {
      loadBoard();
    }
  }, [boardId, dispatch, navigate]);

  useEffect(() => {
    const loadCards = async () => {
      const { fetchCardsByList } = await import('../redux/actions/cardActions');
      for (const list of lists) {
        dispatch(fetchCardsByList(list.id));
      }
    };

    if (lists.length > 0) {
      loadCards();
    }
  }, [lists.length, dispatch]);

  if (!board) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Board board={board} />
    </div>
  );
};

export default BoardPage;
