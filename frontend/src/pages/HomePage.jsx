import React from "react";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import JobCard from "../components/JobCard";
import Footer from "../components/Footer";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="container mx-auto px-4 py-8">
        <SearchBar />
        <section className="mt-8">
          <h2 className="mb-4 text-2xl font-bold">Latest Jobs</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 12 }).map((_, index) => (
              <JobCard key={index} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
