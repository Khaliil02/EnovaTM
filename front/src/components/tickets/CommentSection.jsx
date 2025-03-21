import { useState, useEffect, useContext, useCallback } from 'react';
import { FiSend, FiTrash2, FiMessageSquare } from 'react-icons/fi';
import { commentApi } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const CommentSection = ({ ticketId, ticketDetails }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  
  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await commentApi.getByTicket(ticketId);
      setComments(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [ticketId]); // ticketId as dependency
  
  useEffect(() => {
    fetchComments();
  }, [fetchComments]); // fetchComments as dependency
  
  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    try {
      setLoading(true);
      const response = await commentApi.create(ticketId, newComment);
      
      // Add user_name to the comment for display
      const commentWithName = {
        ...response.data,
        user_name: user.name
      };
      
      setComments([...comments, commentWithName]);
      setNewComment('');
      setError(null);
    } catch (err) {
      console.error('Error adding comment:', err);
      setError(err.response?.data?.error || 'Failed to add comment');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteComment = async (commentId) => {
    try {
      await commentApi.delete(commentId);
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError(err.response?.data?.error || 'Failed to delete comment');
    }
  };
  
  // Check if user can add comments
  const canComment = () => {
    if (!user || !ticketDetails) return false;
    
    const isCreator = ticketDetails.created_by === user.id;
    const isAssignee = ticketDetails.assigned_to === user.id;
    const isDestinationDeptAdmin = user.is_admin && 
      user.department_id === ticketDetails.destination_department_id;
      
    return isCreator || isAssignee || isDestinationDeptAdmin;
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <FiMessageSquare className="mr-2" /> Comments
      </h3>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-gray-50 rounded-lg p-4">
        {/* Comments list */}
        <div className="space-y-4 mb-4">
          {comments.length === 0 ? (
            <p className="text-gray-500 italic text-center py-4">No comments yet</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex items-center mb-2">
                    <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-medium">
                      {comment.user_name?.charAt(0) || 'U'}
                    </div>
                    <div className="ml-2">
                      <p className="font-medium">{comment.user_name || 'Unknown User'}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(comment.creation_date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {comment.user_id === user.id && (
                    <button 
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-gray-400 hover:text-red-600"
                      title="Delete comment"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  )}
                </div>
                <p className="mt-2 text-gray-700 whitespace-pre-line">{comment.content}</p>
              </div>
            ))
          )}
        </div>
        
        {/* Comment form */}
        {canComment() && (
          <form onSubmit={handleAddComment} className="mt-4">
            <div className="flex">
              <textarea
                className="flex-grow rounded-l-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                placeholder="Add a comment..."
                rows="3"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={loading}
                required
              ></textarea>
              <button 
                type="submit" 
                className="bg-primary-600 hover:bg-primary-700 text-white rounded-r-md px-4"
                disabled={loading || !newComment.trim()}
              >
                <FiSend />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CommentSection;