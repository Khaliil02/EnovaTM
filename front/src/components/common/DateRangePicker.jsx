import { useState, useEffect } from 'react';
import { FiCalendar } from 'react-icons/fi';

const DateRangePicker = ({ onChange, initialDateFrom, initialDateTo }) => {
  const [startDate, setStartDate] = useState(initialDateFrom || '');
  const [endDate, setEndDate] = useState(initialDateTo || '');
  
  useEffect(() => {
    setStartDate(initialDateFrom || '');
    setEndDate(initialDateTo || '');
  }, [initialDateFrom, initialDateTo]);
  
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    onChange({
      from: newStartDate ? new Date(newStartDate) : null,
      to: endDate ? new Date(endDate) : null
    });
  };
  
  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);
    onChange({
      from: startDate ? new Date(startDate) : null,
      to: newEndDate ? new Date(newEndDate) : null
    });
  };
  
  const formatDateForInput = (date) => {
    if (!date) return '';
    
    // For date input in format YYYY-MM-DD
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    
    return [year, month, day].join('-');
  };
  
  return (
    <div className="flex items-center space-x-2">
      <div className="relative flex-grow">
        <input
          type="date"
          value={formatDateForInput(startDate)}
          onChange={handleStartDateChange}
          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          placeholder="From"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <FiCalendar className="text-gray-400" />
        </div>
      </div>
      
      <span className="text-gray-500">to</span>
      
      <div className="relative flex-grow">
        <input
          type="date"
          value={formatDateForInput(endDate)}
          onChange={handleEndDateChange}
          min={formatDateForInput(startDate)}
          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          placeholder="To"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <FiCalendar className="text-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker;