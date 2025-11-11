// src/features/Admin/Dashboard/components/components/RankingList.jsx
// (ĐÃ CHUYỂN ĐỔI HOÀN TOÀN)

import React from "react";
// Import file CSS của bạn
import "../Dashboard.css";

// Component cho Top 3 (Rank 1, 2, 3)
const TopRankItem = ({ student, rank }) => {
  // Logic của bạn được giữ nguyên, chỉ thay đổi tên class
  let orderClass = "rank-order-1";
  let sizeClass = "rank-size-sm";
  let crownColor = "rank-crown-silver";
  let rankText = "2";
  let borderColor = "rank-border-silver";
  let rankBg = "rank-badge-silver";

  if (rank === 1) {
    orderClass = "rank-order-2";
    sizeClass = "rank-size-lg";
    crownColor = "rank-crown-gold";
    rankText = "1";
    borderColor = "rank-border-gold";
    rankBg = "rank-badge-gold";
  } else if (rank === 3) {
    orderClass = "rank-order-3";
    crownColor = "rank-crown-bronze";
    rankText = "3";
    borderColor = "rank-border-bronze";
    rankBg = "rank-badge-bronze";
  }

  const truncateName = (name) => {
    if (name.length > 12) {
      return name.substring(0, 10) + "...";
    }
    return name;
  };

  return (
    <div className={`rank-item-top3 ${orderClass}`}>
      <div className="rank-avatar-wrapper">
        <span className={`rank-crown ${crownColor}`}>👑</span>
        <div
          className={`rank-avatar ${sizeClass} ${borderColor}`}
          style={{
            backgroundImage: `url(https://i.pravatar.cc/150?u=${student.name})`,
          }}
        >
          <div className={`rank-number-badge ${rankBg}`}>
            <span>{rankText}</span>
          </div>
        </div>
      </div>
      <h4 className="rank-name">{truncateName(student.name)}</h4>
      <div className="rank-score-wrapper">
        <span className="rank-score-star">🌟</span>
        <span className="rank-score-number">{Math.round(student.score)} </span>
      </div>
    </div>
  );
};

// Component cho các rank còn lại (4, 5, 6...)
const OtherRankItem = ({ student, rank, isHighlighted }) => {
  // Logic của bạn được giữ nguyên
  const itemClass = isHighlighted
    ? "rank-item-highlighted"
    : "rank-item-normal";

  const truncateName = (name) => {
    if (name.length > 10) {
      return name.substring(0, 8) + "...";
    }
    return name;
  };

  return (
    <div className={`rank-item-other ${itemClass}`}>
      <span className="rank-other-number">{rank}</span>
      <div
        className="rank-other-avatar"
        style={{
          backgroundImage: `url(https://i.pravatar.cc/100?u=${student.name})`,
        }}
      ></div>
      <span className="rank-other-name">{truncateName(student.name)} </span>
      <div className="rank-other-score-wrapper">
        <span className="rank-other-score-star">🌟</span>
        <span className="rank-other-score-number">
          {Math.round(student.score)}
        </span>
      </div>
    </div>
  );
};

// Component chính
const RankingList = ({ students }) => {
  if (!students || students.length === 0) {
    return <div>Không có dữ liệu.</div>;
  }

  const top3 = students.slice(0, 3);
  const others = students.slice(3);

  const rank1 = top3[0];
  const rank2 = top3[1];
  const rank3 = top3[2];

  return (
    <div className="ranking-list-container">
      <div className="ranking-title">
        <h3 className="ranking-list-title">
          <span className="ranking-title-icon">🏆</span> Bảng xếp hạng
        </h3>
      </div>
      {/* Top 3 */}
      {top3.length === 3 && (
        <div className="ranking-top3-container">
          {rank2 && <TopRankItem student={rank2} rank={2} />}
          {rank1 && <TopRankItem student={rank1} rank={1} />}
          {rank3 && <TopRankItem student={rank3} rank={3} />}
        </div>
      )}
      {/* Ranks 4+ */}
      <div className="ranking-others-container">
        {others.map((student, index) => {
          const rank = index + 4;
          const isHighlighted = rank === 5;
          return (
            <OtherRankItem
              key={rank}
              student={student}
              rank={rank}
              isHighlighted={isHighlighted}
            />
          );
        })}
      </div>
    </div>
  );
};

export default RankingList;
