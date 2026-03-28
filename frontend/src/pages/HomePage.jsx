import React, { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar";
import JobCard from "../components/JobCard";
import jobService from "../services/job.service";
import recommendService from "../services/recommend.service";
import companyService from "../services/company.service";
import authService from "../services/auth.service";
import CompanyCard from "../components/CompanyCard"; // Import the new CompanyCard

const HomePage = () => {
  const [latestJobs, setLatestJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [topCompanies, setTopCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentCandidate, setCurrentCandidate] = useState(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    if (user && user.user.roles.candidate) {
      const candidate = authService.getCurrentCandidate();
      setCurrentCandidate(candidate);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Latest Jobs
        const latestJobsResponse = await jobService.getJobs({ limit: 12 });
        setLatestJobs(latestJobsResponse.data.data);

        const allCompaniesResponse = await companyService.getMostJobComapny();
        // Sort by number of jobs if available, otherwise just take the first 6
        const sortedCompanies = allCompaniesResponse.data.data.sort((a, b) => (b.jobsCount || 0) - (a.jobsCount || 0));
        setTopCompanies(sortedCompanies.slice(0, 6));

        // Fetch Recommended Jobs (if candidate is logged in)
        const recommendedJobsResponse = await recommendService.recommendJobs();
        setRecommendedJobs(recommendedJobsResponse.data);

      } catch (error) {
        console.error("Error fetching data for homepage:", error);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch data once currentUser and currentCandidate status are determined
    if (currentUser !== undefined && currentCandidate !== undefined) {
      fetchData();
    }
  }, [currentUser, currentCandidate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="container mx-auto px-4 py-8">
        <SearchBar />

        {recommendedJobs.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-4 text-2xl font-bold text-green-500">Công việc được đề xuất</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recommendedJobs.map((item) => (
                <JobCard key={item.job._id} job={item.job} />
              ))}
            </div>
          </section>
        )}

        <section className="mt-8">
          <h2 className="mb-4 text-2xl font-bold text-green-500">Công việc mới nhất</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {latestJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-4 text-2xl font-bold text-green-500">Các công ty nổi bật</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {topCompanies.map((company) => (
              <CompanyCard key={company._id} company={company} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
