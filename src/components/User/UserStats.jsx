// src/components/users/UserStats.jsx
import React from 'react';
import { FaUser, FaUserCheck, FaUserTimes } from "react-icons/fa";

const UserStats = ({ stats }) => {
    const statCards = [
        {
            label: 'Total Users',
            value: stats.total,
            icon: <FaUser className="text-blue-600 text-xl" />,
            bgColor: 'bg-blue-100',
            textColor: 'text-gray-800'
        },
        {
            label: 'Active Users',
            value: stats.active,
            icon: <FaUserCheck className="text-green-600 text-xl" />,
            bgColor: 'bg-green-100',
            textColor: 'text-green-600'
        },
        {
            label: 'Inactive Users',
            value: stats.inactive,
            icon: <FaUserTimes className="text-red-600 text-xl" />,
            bgColor: 'bg-red-100',
            textColor: 'text-red-600'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statCards.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                            <p className={`text-3xl font-bold mt-2 ${stat.textColor}`}>{stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                            {stat.icon}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default UserStats;