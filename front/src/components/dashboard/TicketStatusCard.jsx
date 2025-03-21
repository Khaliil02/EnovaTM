import { Link } from 'react-router-dom';

const TicketStatusCard = ({ title, count, color, link }) => {
  return (
    <Link to={link} className="block">
      <div className={`${color} rounded-lg p-6 hover:opacity-90 transition-opacity`}>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-3xl font-bold mt-1">{count}</p>
      </div>
    </Link>
  );
};

export default TicketStatusCard;