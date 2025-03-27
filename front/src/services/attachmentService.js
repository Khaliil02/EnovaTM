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

const deleteAttachment = async (attachmentId) => {
  const response = await api.delete(`/attachments/${attachmentId}`);
  return response;
};

const getAttachmentViewUrl = (attachmentId) => {
  // Get the token from localStorage or wherever you store it
  const token = localStorage.getItem('token'); // adjust based on your token storage
  return `${api.defaults.baseURL}/attachments/${attachmentId}/view?token=${token}`;
};

export {
  uploadAttachment,
  getTicketAttachments,
  deleteAttachment,
  getAttachmentViewUrl
};