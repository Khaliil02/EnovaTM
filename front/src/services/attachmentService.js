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

// Get view URL for an attachment
const getAttachmentViewUrl = (attachmentId) => {
  return `${api.defaults.baseURL}/attachments/${attachmentId}/view`;
};

const deleteAttachment = async (attachmentId) => {
  const response = await api.delete(`/attachments/${attachmentId}`);
  return response;
};

export {
  uploadAttachment,
  getTicketAttachments,
  getAttachmentViewUrl,
  deleteAttachment
};