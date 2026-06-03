import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import vnSubdivisions from "../utils/VNRegions"; 
import searchIcon from "../assets/search.svg"; // Import search icon
import locationIcon from "../assets/location.svg"; // Import location icon

const SearchBar = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  // Lấy danh sách tên các tỉnh (Keys của object)
  const provinces = Object.keys(vnSubdivisions);

  // State lưu trữ tỉnh đang chọn và danh sách phường xã tương ứng
  const [selectedProvince, setSelectedProvince] = useState("");
  const [availableWards, setAvailableWards] = useState([]);
  const [selectedWard, setSelectedWard] = useState(""); // Add state for selected ward
  const [keyword, setKeyword] = useState(""); // Add state for keyword

  // Hàm xử lý khi thay đổi Tỉnh/Thành
  const handleProvinceChange = (e) => {
    const provinceName = e.target.value;
    setSelectedProvince(provinceName);
    setSelectedWard(""); // Reset ward when province changes
    
    // Cập nhật danh sách phường xã dựa trên tỉnh đã chọn
    // Giả định vnSubdivisions[provinceName] trả về một mảng các phường/xã
    setAvailableWards(vnSubdivisions[provinceName] || []);
  };

  const handleWardChange = (e) => { // Add handler for ward change
    setSelectedWard(e.target.value);
  };

  const handleSearch = () => {
    const queryParams = new URLSearchParams();
    if (keyword) {
      queryParams.append("keyword", keyword);
    }
    if (selectedProvince) {
      queryParams.append("province", selectedProvince);
    }
    if (selectedWard) {
      queryParams.append("ward", selectedWard);
    }
    navigate(`/search?${queryParams.toString()}`); // Thay đổi để chỉ sử dụng query parameters
  };

  return (
    <div className="rounded-xl bg-gray-800 p-6 shadow-2xl border border-gray-700">
      <div className="flex flex-col gap-3 md:flex-row">
        
        {/* KEYWORD - LARGEST (flex-[3]) */}
        <div className="flex-[3] relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <img src={searchIcon} alt="Search" className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Chức danh, từ khóa hoặc công ty..."
            className="w-full rounded-lg border border-gray-600 bg-gray-700 pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
        </div>

        {/* SELECT PROVINCE - SMALL (flex-1) */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <img src={locationIcon} alt="Location" className="h-5 w-5 text-gray-400" />
          </div>
          <select
            className="w-full rounded-lg border border-gray-600 bg-gray-700 pl-10 pr-4 py-3 text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 appearance-none"
            value={selectedProvince}
            onChange={handleProvinceChange}
          >
            <option value="" >
              Tỉnh/Thành phố
            </option>
            {provinces.map((p, i) => (
              <option key={i} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* CHỌN PHƯỜNG/XÃ - BÉ (flex-1) */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <img src={locationIcon} alt="Location" className="h-5 w-5 text-gray-400" />
          </div>
          <select
            className="w-full rounded-lg border border-gray-600 bg-gray-700 pl-10 pr-4 py-3 text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 appearance-none"
            defaultValue=""
            value={selectedWard} // Bind value to selectedWard state
            onChange={handleWardChange} // Add onChange handler
            disabled={!selectedProvince} // Khóa ô này nếu chưa chọn tỉnh
          >
            <option value="" >
              {selectedProvince ? "Chọn Phường/Xã" : "Chọn Tỉnh trước"}
            </option>
            {availableWards.map((w, i) => (
              <option key={i} value={w}>{w}</option>
            ))}
          </select>
        </div>

        {/* NÚT TÌM KIẾM */}
        <button
          onClick={handleSearch} // Call handleSearch on button click
          className="rounded-lg bg-green-600 px-8 py-3 font-bold text-white transition-all duration-300 hover:bg-green-700 active:scale-95">
          Tìm kiếm
        </button>

      </div>
    </div>
  );
};

export default SearchBar;