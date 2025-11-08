import axios from 'axios';
import Board from '../models/Board.js';
import Card from '../models/Card.js';

export const generateSubtasks = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    const prompt = `You are a project planning assistant. Given the task title "${title}" and description "${description || 'No description provided'}", generate 3-5 short, actionable subtasks as a JSON array of strings. Each subtask should be clear, specific, and achievable. Return ONLY the JSON array, no additional text or formatting.

Example format: ["Research UI patterns", "Design board layout", "Implement drag & drop", "Add styling", "Test functionality"]`;
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    const aiResponse = response.data.candidates[0].content.parts[0].text;
    
    let subtasks;
    try {
      const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
      subtasks = JSON.parse(cleanedResponse);
    } catch (parseError) {
      const arrayMatch = aiResponse.match(/\[.*\]/s);
      if (arrayMatch) {
        subtasks = JSON.parse(arrayMatch[0]);
      } else {
        throw new Error('Failed to parse AI response');
      }
    }
    
    const subtaskObjects = subtasks.map(text => ({
      text,
      completed: false
    }));
    
    res.json({ subtasks: subtaskObjects });
  } catch (error) {
    console.error('AI Subtask Generation Error:', error.response?.data || error.message);
    res.status(500).json({ 
      message: 'Failed to generate subtasks',
      error: error.message 
    });
  }
};

export const generateBoardSummary = async (req, res) => {
  try {
    const { boardId } = req.body;
    
    if (!boardId) {
      return res.status(400).json({ message: 'Board ID is required' });
    }
    
    const board = await Board.findById(boardId).populate({
      path: 'lists',
      populate: { path: 'cards' }
    });
    
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    const boardData = {
      title: board.title,
      lists: board.lists.map(list => ({
        title: list.title,
        cardCount: list.cards.length,
        cards: list.cards.map(card => ({
          title: card.title,
          subtaskCount: card.subtasks.length,
          completedSubtasks: card.subtasks.filter(st => st.completed).length
        }))
      }))
    };
    
    const totalCards = board.lists.reduce((sum, list) => sum + list.cards.length, 0);
    const totalSubtasks = board.lists.reduce((sum, list) => 
      sum + list.cards.reduce((cardSum, card) => cardSum + card.subtasks.length, 0), 0);
    const completedSubtasks = board.lists.reduce((sum, list) => 
      sum + list.cards.reduce((cardSum, card) => 
        cardSum + card.subtasks.filter(st => st.completed).length, 0), 0);
    
    const prompt = `You are a project management assistant. Analyze this board and provide a concise, insightful summary (2-3 sentences).

Board: "${board.title}"
Lists: ${board.lists.length}
Total Cards: ${totalCards}
Total Subtasks: ${totalSubtasks}
Completed Subtasks: ${completedSubtasks}

Lists breakdown:
${boardData.lists.map(list => `- ${list.title}: ${list.cardCount} cards`).join('\n')}

Provide insights about progress, focus areas, and any recommendations. Be specific and actionable.`;
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    const summary = response.data.candidates[0].content.parts[0].text;
    
    res.json({ 
      summary,
      stats: {
        totalCards,
        totalSubtasks,
        completedSubtasks,
        completionRate: totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0
      }
    });
  } catch (error) {
    console.error('AI Summary Generation Error:', error.response?.data || error.message);
    res.status(500).json({ 
      message: 'Failed to generate summary',
      error: error.message 
    });
  }
};
