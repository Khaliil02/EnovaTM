import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const DepartmentDistributionChart = ({ tickets, departments }) => {
  const data = useMemo(() => {
    // Count tickets by destination department
    const deptCounts = tickets.reduce((acc, ticket) => {
      const deptId = ticket.destination_department_id;
      if (deptId) {
        acc[deptId] = (acc[deptId] || 0) + 1;
      }
      return acc;
    }, {});
    
    // Create chart data with department names
    return Object.entries(deptCounts).map(([deptId, count]) => {
      const dept = departments.find(d => d.id === parseInt(deptId));
      return {
        name: dept ? dept.name : `Department ${deptId}`,
        count: count,
        fill: generateDepartmentColor(parseInt(deptId))
      };
    }).sort((a, b) => b.count - a.count);
  }, [tickets, departments]);
  
  // Generate colors for departments
  function generateDepartmentColor(deptId) {
    const colors = [
      '#3B82F6', // blue
      '#10B981', // green
      '#F59E0B', // amber
      '#6366F1', // indigo
      '#EC4899', // pink
      '#8B5CF6', // purple
      '#14B8A6', // teal
      '#F97316'  // orange
    ];
    
    return colors[deptId % colors.length] || colors[0];
  }
  
  if (data.length === 0) {
    return <div className="text-center text-gray-500 py-12">No department data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
        <XAxis type="number" />
        <YAxis 
          type="category" 
          dataKey="name" 
          tick={{ fontSize: 12 }}
          width={100}
        />
        <Tooltip 
          formatter={(value) => [`${value} tickets`, 'Count']}
          labelStyle={{ fontWeight: 'bold' }}
        />
        <Bar 
          dataKey="count" 
          radius={[0, 4, 4, 0]}
          label={{ position: 'right', fontSize: 12 }}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DepartmentDistributionChart;