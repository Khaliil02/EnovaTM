import api from './api';

const uploadAttachment = async (ticketId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post(
    `/attachments/ticket/${ticketId}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  
  return response;
};

const getTicketAttachments = async (ticketId) => {
  const response = await api.get(`/attachments/ticket/${ticketId}`);
  return response;
};

const downloadAttachment = async (attachmentId) => {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Include the token in the URL as a query parameter
    const downloadUrl = `${api.defaults.baseURL}/attachments/${attachmentId}/download?token=${token}`;
    
    // Open in a new tab/window
    window.open(downloadUrl, '_blank');
  } catch (error) {
    console.error('Error downloading attachment:', error);
    throw error;
  }
};

const deleteAttachment = async (attachmentId) => {
  const response = await api.delete(`/attachments/${attachmentId}`);
  return response;
};

export {
  uploadAttachment,
  getTicketAttachments,
  downloadAttachment,
  deleteAttachment
};