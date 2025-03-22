const cache = {
  data: new Map(),
  ttl: 5 * 60 * 1000, // 5 minutes cache
  
  // Add item to cache
  set(key, value) {
    this.data.set(key, {
      value,
      timestamp: Date.now()
    });
  },
  
  // Get item from cache
  get(key) {
    const item = this.data.get(key);
    if (!item) return null;
    
    // Check if expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.data.delete(key);
      return null;
    }
    
    return item.value;
  },
  
  // Clear entire cache
  clear() {
    this.data.clear();
  },
  
  // Clear cache for specific API endpoint
  clearEndpoint(endpoint) {
    for (const key of this.data.keys()) {
      if (key.includes(endpoint)) {
        this.data.delete(key);
      }
    }
  }
};

export default cache;