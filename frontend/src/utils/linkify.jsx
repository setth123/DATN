import React from 'react';

/**
 * Tìm kiếm các URL trong một chuỗi văn bản và chuyển đổi chúng thành các thẻ <a> có thể nhấp được.
 * @param {string} text - Chuỗi văn bản đầu vào.
 * @returns {Array<React.Node>} - Một mảng các phần tử React, với các URL được bọc trong thẻ <a>.
 */
const linkify = (text) => {
  // Regex để tìm URL trong văn bản
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  if (typeof text !== 'string') {
    return text;
  }

  // Tách văn bản thành các phần dựa trên regex URL
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    // Nếu một phần khớp với regex URL, hãy tạo một liên kết
    if (part.match(urlRegex)) {
      let cleanUrl=part;
      if (cleanUrl.startsWith('(') && cleanUrl.endsWith(')')) {
        cleanUrl = cleanUrl.slice(1, -1);
      }
      else if (cleanUrl.endsWith(')') && !cleanUrl.includes('(')) {
        cleanUrl = cleanUrl.slice(0, -1);
      }
      return (
        <a
          key={index}
          href={cleanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline"
        >
          {cleanUrl}
        </a>
      );
    }
    // Nếu không, trả về phần văn bản thuần túy
    return part;
  });
};
export default linkify;