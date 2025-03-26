/**
 * Get a formatted user name from the user ID
 * @param {number} userId - The user ID to look up
 * @param {Array} users - Array of user objects
 * @returns {string} - The formatted user name or 'Unknown User'
 */
export const getUserName = (userId, users) => {
  if (!userId || !users || !users.length) return 'Unknown User';
  
  const foundUser = users.find(u => u.id === userId);
  if (!foundUser) return 'Unknown User';
  
  return foundUser.name || 'Unknown User';
};

// Create a memoized version for performance
export const createUserNameLookup = (users) => {
  const userMap = new Map();
  
  return (userId) => {
    if (!userId) return 'Unknown User';
    
    // Check cache first
    if (userMap.has(userId)) {
      return userMap.get(userId);
    }
    
    // Find user and cache the result
    const userName = getUserName(userId, users);
    userMap.set(userId, userName);
    return userName;
  };
};