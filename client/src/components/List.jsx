import React, { memo, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { updateList, deleteList } from '../redux/actions/listActions';
import { createCard } from '../redux/actions/cardActions';
import { selectCardsByList } from '../redux/selectors/cardSelectors';
import Card from './Card';
import toast from 'react-hot-toast';

const List = memo(({ list, index }) => {
  const dispatch = useDispatch();
  const cards = useSelector(state => selectCardsByList(state, list.id));
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [showAddCard, setShowAddCard] = useState(false);

  const handleUpdateTitle = useCallback(async () => {
    if (title.trim() && title !== list.title) {
      try {
        await dispatch(updateList({ id: list.id, data: { title } })).unwrap();
        setIsEditingTitle(false);
        toast.success('List updated!');
      } catch (error) {
        toast.error('Failed to update list');
      }
    } else {
      setIsEditingTitle(false);
    }
  }, [dispatch, list.id, list.title, title]);

  const handleDeleteList = useCallback(async () => {
    if (window.confirm(`Delete list "${list.title}" and all its cards?`)) {
      try {
        await dispatch(deleteList(list.id)).unwrap();
        toast.success('List deleted!');
      } catch (error) {
        toast.error('Failed to delete list');
      }
    }
  }, [dispatch, list.id, list.title]);

  const handleAddCard = useCallback(async () => {
    if (newCardTitle.trim()) {
      try {
        await dispatch(createCard({ 
          listId: list.id, 
          title: newCardTitle.trim() 
        })).unwrap();
        setNewCardTitle('');
        setShowAddCard(false);
        toast.success('Card added!');
      } catch (error) {
        toast.error('Failed to add card');
      }
    }
  }, [dispatch, list.id, newCardTitle]);

  const cardElements = useMemo(() => 
    cards.map((card, idx) => <Card key={card.id} card={card} index={idx} />),
    [cards]
  );

  const listColors = [
    'bg-[#B3E5FC] border-[#4FC3F7]',
    'bg-[#C8E6C9] border-[#66BB6A]',
    'bg-[#E1BEE7] border-[#AB47BC]',
    'bg-[#FFCCBC] border-[#FF7043]',
    'bg-[#F8BBD0] border-[#EC407A]'
  ];
  const colorClass = listColors[index % listColors.length];

  return (
    <Draggable draggableId={list.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`flex-shrink-0 w-72 ${snapshot.isDragging ? 'opacity-50' : ''}`}
        >
          <div className={`bg-gray-50 rounded-lg border-2 ${colorClass} p-3 h-full flex flex-col`}>
            {/* List Header */}
            <div {...provided.dragHandleProps} className="mb-3">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleUpdateTitle}
                  onKeyPress={(e) => e.key === 'Enter' && handleUpdateTitle()}
                  className="w-full px-2 py-1 border border-gray-300 rounded font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
              ) : (
                <div className="flex justify-between items-center">
                  <h3
                    className="font-semibold text-gray-800 cursor-pointer flex-1"
                    onClick={() => setIsEditingTitle(true)}
                  >
                    {list.title}
                    <span className="ml-2 text-sm text-gray-500">({cards.length})</span>
                  </h3>
                  <button
                    onClick={handleDeleteList}
                    className="text-gray-400 hover:text-red-500 text-sm"
                    title="Delete list"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>

            {/* Cards */}
            <Droppable droppableId={list.id} type="card">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 overflow-y-auto min-h-[100px] ${
                    snapshot.isDraggingOver ? 'bg-blue-50 rounded' : ''
                  }`}
                >
                  {cardElements}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {/* Add Card */}
            <div className="mt-2">
              {showAddCard ? (
                <div className="space-y-2">
                  <textarea
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    placeholder="Enter card title..."
                    className="w-full px-2 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    rows="2"
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddCard();
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddCard}
                      className="px-3 py-1 bg-primary-500 text-white rounded text-sm hover:bg-primary-600"
                    >
                      Add Card
                    </button>
                    <button
                      onClick={() => {
                        setShowAddCard(false);
                        setNewCardTitle('');
                      }}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddCard(true)}
                  className="w-full px-3 py-2 text-left text-gray-600 hover:bg-gray-200 rounded transition-colors"
                >
                  + Add a card
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
});

List.displayName = 'List';

export default List;
