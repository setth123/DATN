import React, { useState } from "react";
import vnSubdivisions from "../utils/VNRegions"; 

const SearchBar = () => {
  // Lấy danh sách tên các tỉnh (Keys của object)
  const provinces = Object.keys(vnSubdivisions);

  // State lưu trữ tỉnh đang chọn và danh sách phường xã tương ứng
  const [selectedProvince, setSelectedProvince] = useState("");
  const [availableWards, setAvailableWards] = useState([]);

  // Hàm xử lý khi thay đổi Tỉnh/Thành
  const handleProvinceChange = (e) => {
    const provinceName = e.target.value;
    setSelectedProvince(provinceName);
    
    // Cập nhật danh sách phường xã dựa trên tỉnh đã chọn
    // Giả định vnSubdivisions[provinceName] trả về một mảng các phường/xã
    setAvailableWards(vnSubdivisions[provinceName] || []);
  };

  return (
    <div className="rounded-xl bg-gray-800 p-6 shadow-2xl border border-gray-700">
      <div className="flex flex-col gap-3 md:flex-row">
        
        {/* TỪ KHÓA - TO NHẤT (flex-[3]) */}
        <div className="flex-[3]">
          <input
            type="text"
            placeholder="Chức danh, từ khóa hoặc công ty..."
            className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        {/* CHỌN TỈNH/THÀNH - BÉ (flex-1) */}
        <div className="flex-1">
          <select 
            className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-3 text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            value={selectedProvince}
            onChange={handleProvinceChange}
          >
            <option value="" disabled>Tỉnh/Thành phố</option>
            {provinces.map((p, i) => (
              <option key={i} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* CHỌN PHƯỜNG/XÃ - BÉ (flex-1) */}
        <div className="flex-1">
          <select 
            className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-3 text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            defaultValue=""
            disabled={!selectedProvince} // Khóa ô này nếu chưa chọn tỉnh
          >
            <option value="" disabled>
              {selectedProvince ? "Chọn Phường/Xã" : "Chọn Tỉnh trước"}
            </option>
            {availableWards.map((w, i) => (
              <option key={i} value={w}>{w}</option>
            ))}
          </select>
        </div>

        {/* NÚT TÌM KIẾM */}
        <button className="rounded-lg bg-green-600 px-8 py-3 font-bold text-white transition-all duration-300 hover:bg-green-700 active:scale-95">
          Tìm kiếm
        </button>

      </div>
    </div>
  );
};

export default SearchBar;