import React, { memo, useState, useCallback, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { selectListsByBoard } from '../redux/selectors/listSelectors';
import { createList, updateList } from '../redux/actions/listActions';
import { updateCard } from '../redux/actions/cardActions';
import { moveCard } from '../redux/reducers/cardReducer';
import { updateListCards } from '../redux/reducers/listReducer';
import { selectCardsByList } from '../redux/selectors/cardSelectors';
import List from './List';
import AISummary from './AISummary';
import toast from 'react-hot-toast';

const Board = memo(({ board }) => {
  const dispatch = useDispatch();
  const lists = useSelector(state => selectListsByBoard(state, board.id));
  const [newListTitle, setNewListTitle] = useState('');
  const [showAddList, setShowAddList] = useState(false);

  const handleAddList = useCallback(async () => {
    if (newListTitle.trim()) {
      try {
        await dispatch(createList({ 
          boardId: board.id, 
          title: newListTitle.trim() 
        })).unwrap();
        setNewListTitle('');
        setShowAddList(false);
        toast.success('List added!');
      } catch (error) {
        toast.error('Failed to add list');
      }
    }
  }, [dispatch, board.id, newListTitle]);

  const onDragEnd = useCallback(async (result) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    if (type === 'list') {
      const newListOrder = Array.from(lists);
      const [removed] = newListOrder.splice(source.index, 1);
      newListOrder.splice(destination.index, 0, removed);

      newListOrder.forEach((list, index) => {
        dispatch(updateList({ id: list.id, data: { order: index } }));
      });
      return;
    }

    if (type === 'card') {
      const sourceListId = source.droppableId;
      const destListId = destination.droppableId;

      if (sourceListId === destListId) {
        const list = lists.find(l => l.id === sourceListId);
        const cards = useSelector.getState().cards.byId;
        const listCards = list.cards
          .map(cardId => cards[cardId])
          .filter(Boolean)
          .sort((a, b) => a.order - b.order);

        const [removed] = listCards.splice(source.index, 1);
        listCards.splice(destination.index, 0, removed);

        // Update card orders
        listCards.forEach((card, index) => {
          dispatch(updateCard({ id: card.id, data: { order: index } }));
        });
      } else {
        dispatch(moveCard({ cardId: draggableId, newListId: destListId }));
        
        try {
          await dispatch(updateCard({
            id: draggableId,
            data: { listId: destListId, order: destination.index }
          })).unwrap();
        } catch (error) {
          toast.error('Failed to move card');
        }
      }
    }
  }, [dispatch, lists]);

  const listElements = useMemo(() => 
    lists.map((list, idx) => <List key={list.id} list={list} index={idx} />),
    [lists]
  );

  return (
    <div className="h-full flex flex-col">
      {/* Board Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">{board.title}</h2>
        <AISummary boardId={board.id} />
      </div>

      {/* Board Content */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="board" type="list" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex gap-4 h-full"
              >
                {listElements}
                {provided.placeholder}

                {/* Add List */}
                <div className="flex-shrink-0 w-72">
                  {showAddList ? (
                    <div className="bg-gray-100 rounded-lg p-3 border-2 border-gray-300">
                      <input
                        type="text"
                        value={newListTitle}
                        onChange={(e) => setNewListTitle(e.target.value)}
                        placeholder="Enter list title..."
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2"
                        autoFocus
                        onKeyPress={(e) => e.key === 'Enter' && handleAddList()}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddList}
                          className="px-3 py-1 bg-primary-500 text-white rounded text-sm hover:bg-primary-600"
                        >
                          Add List
                        </button>
                        <button
                          onClick={() => {
                            setShowAddList(false);
                            setNewListTitle('');
                          }}
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddList(true)}
                      className="w-full px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-medium transition-colors"
                    >
                      + Add another list
                    </button>
                  )}
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
});

Board.displayName = 'Board';

export default Board;
