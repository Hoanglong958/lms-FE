import React from "react";

const RecentTransactionsList = ({ transactions }) => (
  <div className="space-y-4"> {/* tăng khoảng cách giữa các item */}
    {transactions.map((tx) => (
      <div
        key={tx.id}
        className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex items-center space-x-4">
          {/* icon to hơn */}
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-50 text-green-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"  // tăng size icon
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <div>
            {/* chữ to hơn */}
            <div className="font-semibold text-base text-gray-800">
              {tx.user}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {tx.course} • <span className="text-gray-400">{tx.time}</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          {/* tiền to hơn */}
          <div className="text-base font-bold text-gray-800">
            {tx.amount}
          </div>

          {/* badge to hơn */}
          <div
            className={`text-xs font-medium px-3 py-1 rounded-full mt-2 inline-block ${
              tx.status === "Thành công"
                ? "bg-green-100 text-green-700"
                : tx.status === "Đang xử lý"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {tx.status}
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default RecentTransactionsList;