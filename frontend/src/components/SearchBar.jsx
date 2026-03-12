import React from "react";

const SearchBar = () => {
  return (
    <div className="rounded-lg bg-gray-800 p-6 shadow-lg">
      <div className="flex flex-col gap-4 md:flex-row">
        <input
          type="text"
          placeholder="Job title, keywords, or company"
          className="flex-grow rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
          type="text"
          placeholder="City, state, or zip code"
          className="flex-grow rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button className="rounded-lg bg-green-600 px-6 py-2 font-bold text-white transition duration-300 hover:bg-green-700">
          Search
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
