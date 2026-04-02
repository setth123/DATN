import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import JobCard from "../components/JobCard";
import SearchBar from "../components/SearchBar"; // Import SearchBar
import Pagination from "../components/Pagination"; // Import the new Pagination component
import sortIcon from "../assets/sort.svg"; // Import sort icon
import jobService from "../services/job.service";

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOrder, setSortOrder] = useState("newest"); // Add state for sort order
  const jobsPerPage = 9; // Define how many jobs per page

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        const keyword = searchParams.get("keyword") || "";
        const province = searchParams.get("province") || "";
        const ward = searchParams.get("ward") || "";

        const locations = [];
        if (ward) locations.push(ward);
        if (province) locations.push(province);

        const query = {
          keyword,
          locations: locations.length > 0 ? locations.join(',') : undefined, // Join locations for backend if needed
          page: currentPage,
          limit: jobsPerPage,
          sort: sortOrder, // Add sort order to the query
        };

        // Remove undefined values from query
        Object.keys(query).forEach(key => query[key] === undefined && delete query[key]);

        const response = await jobService.getJobs(query);
        setJobs(response.data.data); // Assuming response.data.data is the array of jobs
        setTotalPages(Math.ceil(response.data.pagination.total / jobsPerPage)); // Correctly access total from pagination object
      } catch (err) {
        console.error("Error fetching search results:", err);
        setError("Failed to load job listings.");
      } finally {
        setLoading(false);
      }
    }; 

    fetchJobs();
  }, [searchParams, currentPage, sortOrder]); // Re-fetch when search params, page, or sortOrder changes

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return ( // Render SearchBar even when loading
      <div className="min-h-screen bg-gray-900 text-white">
        <main className="container mx-auto px-4 py-8">
          <SearchBar />
          <p className="text-center mt-8">Đang tải kết quả tìm kiếm...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return ( // Render SearchBar even when there's an error
      <div className="min-h-screen bg-gray-900 text-white">
        <main className="container mx-auto px-4 py-8">
          <SearchBar />
          <p className="text-center mt-8 text-red-500">{error}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="container mx-auto px-4 py-8">
        <SearchBar /> {/* Add SearchBar here */}
        <div className="flex justify-between items-center mt-5 mb-6">
          <h2 className="text-3xl font-bold text-green-500">
            Kết quả tìm kiếm
          </h2>
          <div className="flex items-center">
            <img src={sortIcon} alt="Sort" className="h-7 w-7 mr-2" /> {/* Moved sort icon here */}
            <label htmlFor="sort-by" className="mr-2 text-gray-300">
              Sắp xếp theo:</label>
            <select
              id="sort-by"
              className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
          </div>
        </div>


        {jobs.length === 0 ? (
          <p className="text-center text-gray-400">Không tìm thấy công việc nào phù hợp.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default SearchResultsPage;
