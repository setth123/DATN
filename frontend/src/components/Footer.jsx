import React from "react";

const Footer = () => {
  return (
    <footer className="mt-12 bg-gray-800 py-8 text-white">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; 2026 JobFinder. All rights reserved.</p>
        <div className="mt-4 flex justify-center space-x-4">
          <a href="#" className="hover:text-green-500">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-green-500">
            Terms of Service
          </a>
          <a href="#" className="hover:text-green-500">
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
