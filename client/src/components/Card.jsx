import React, { memo, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Draggable } from '@hello-pangea/dnd';
import { updateCard, deleteCard, generateAISubtasks } from '../redux/actions/cardActions';
import { toggleSubtask } from '../redux/reducers/cardReducer';
import { selectAILoading } from '../redux/selectors/cardSelectors';
import toast from 'react-hot-toast';

const Card = memo(({ card, index }) => {
  const dispatch = useDispatch();
  const aiLoading = useSelector(selectAILoading);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [showDetails, setShowDetails] = useState(false);

  const handleSave = useCallback(async () => {
    if (title.trim()) {
      try {
        await dispatch(updateCard({ 
          id: card.id, 
          data: { title, description } 
        })).unwrap();
        setIsEditing(false);
        toast.success('Card updated!');
      } catch (error) {
        toast.error('Failed to update card');
      }
    }
  }, [dispatch, card.id, title, description]);

  const handleDelete = useCallback(async () => {
    if (window.confirm('Delete this card?')) {
      try {
        await dispatch(deleteCard(card.id)).unwrap();
        toast.success('Card deleted!');
      } catch (error) {
        toast.error('Failed to delete card');
      }
    }
  }, [dispatch, card.id]);

  const handleGenerateSubtasks = useCallback(async () => {
    try {
      await dispatch(generateAISubtasks({
        cardId: card.id,
        title: card.title,
        description: card.description
      })).unwrap();
      toast.success('✨ AI subtasks generated!');
    } catch (error) {
      toast.error('Failed to generate subtasks');
    }
  }, [dispatch, card.id, card.title, card.description]);

  const handleToggleSubtask = useCallback(async (subtaskIndex) => {
    dispatch(toggleSubtask({ cardId: card.id, subtaskIndex }));
    const updatedSubtasks = [...card.subtasks];
    updatedSubtasks[subtaskIndex].completed = !updatedSubtasks[subtaskIndex].completed;
    
    try {
      await dispatch(updateCard({
        id: card.id,
        data: { subtasks: updatedSubtasks }
      })).unwrap();
    } catch (error) {
      toast.error('Failed to update subtask');
    }
  }, [dispatch, card.id, card.subtasks]);

  const completedSubtasks = card.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = card.subtasks?.length || 0;

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-lg shadow-sm p-3 mb-2 border border-gray-200 hover:shadow-md transition-shadow ${
            snapshot.isDragging ? 'shadow-lg rotate-2' : ''
          }`}
        >
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description..."
                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                rows="2"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-3 py-1 bg-primary-500 text-white rounded text-sm hover:bg-primary-600"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setTitle(card.title);
                    setDescription(card.description);
                    setIsEditing(false);
                  }}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start mb-2">
                <h4 
                  className="font-medium text-gray-800 flex-1 cursor-pointer"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {card.title}
                </h4>
                <div className="flex gap-1">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray-400 hover:text-primary-500 text-sm"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={handleDelete}
                    className="text-gray-400 hover:text-red-500 text-sm"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {card.description && showDetails && (
                <p className="text-sm text-gray-600 mb-2">{card.description}</p>
              )}

              {totalSubtasks > 0 && (
                <div className="mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-green-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {completedSubtasks}/{totalSubtasks}
                    </span>
                  </div>
                  {showDetails && (
                    <div className="space-y-1 mt-2">
                      {card.subtasks.map((subtask, idx) => (
                        <label key={idx} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={subtask.completed}
                            onChange={() => handleToggleSubtask(idx)}
                            className="rounded text-primary-500 focus:ring-primary-500"
                          />
                          <span className={subtask.completed ? 'line-through text-gray-400' : 'text-gray-700'}>
                            {subtask.text}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleGenerateSubtasks}
                disabled={aiLoading}
                className="w-full mt-2 px-2 py-1 bg-primary-500 text-white rounded text-xs hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aiLoading ? '⏳ Generating...' : '✨ AI Suggest Subtasks'}
              </button>
            </>
          )}
        </div>
      )}
    </Draggable>
  );
});

Card.displayName = 'Card';

export default Card;
