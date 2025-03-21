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

const downloadAttachment = (attachmentId, filename) => {
  // For downloads, we need to include the token in the URL or open in a new tab
  const token = localStorage.getItem('token');
  window.open(`${api.defaults.baseURL}/attachments/${attachmentId}/download?token=${token}`, '_blank');
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