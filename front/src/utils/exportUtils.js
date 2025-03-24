/**
 * Utility functions for exporting chart data
 */

export const exportToCSV = (data, filename) => {
  // Create CSV content
  let csvContent = "data:text/csv;charset=utf-8,";
  
  // Add headers
  const headers = Object.keys(data[0]).join(",");
  csvContent += headers + "\r\n";
  
  // Add rows
  data.forEach(item => {
    const row = Object.values(item).join(",");
    csvContent += row + "\r\n";
  });
  
  // Create download link
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  
  // Trigger download
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = async (chartId, filename) => {
  try {
    // This would typically use a library like jsPDF or html2pdf
    // For simplicity, we'll use browser print with a warning
    alert('PDF export would typically use a library like jsPDF. For now, you can use the print dialog to save as PDF.');
    window.print();
  } catch (error) {
    console.error('Error exporting to PDF:', error);
  }
};

export const prepareTicketDataForExport = (tickets) => {
  return tickets.map(ticket => ({
    ID: ticket.id,
    Title: ticket.title,
    Status: ticket.status,
    Priority: ticket.priority,
    CreatedBy: ticket.created_by,
    AssignedTo: ticket.assigned_to,
    CreatedOn: new Date(ticket.creation_date).toLocaleDateString(),
    UpdatedOn: ticket.updated_at ? new Date(ticket.updated_at).toLocaleDateString() : ''
  }));
};