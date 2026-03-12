import * as candidateService from "../services/candidate.service.js";
import { deleteFile } from "../services/file.service.js"; // Import deleteFile service

export const getMyProfile = async (req, res) => {
  try {
    const profile = await candidateService.getMyCandidateProfile(req.user.userId);
    res.json({ data: profile });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const createOrUpdateProfile = async (req, res) => {
  try {
    const profileData = { ...req.body };
    if (req.file) {
      profileData.cv = req.file.path;
      profileData.cvName = req.file.originalname;
    }
    if (req.body.deleteCv === 'true') { // Check if deleteCv flag is explicitly 'true'
      // If a CV file URL was provided for deletion, delete the physical file
      if (req.body.cvFileUrlToDelete) {
        await deleteFile(req.body.cvFileUrlToDelete);
      }
      profileData.cv = "";
      profileData.cvName = "";
    }

    // Since the frontend sends these as JSON strings, we need to parse them
    if (profileData.skills) {
      profileData.skills = JSON.parse(profileData.skills);
    }
    if (profileData.experiences) {
      profileData.experiences = JSON.parse(profileData.experiences);
    }
    if (profileData.education) {
      profileData.education = JSON.parse(profileData.education);
    }

    const profile = await candidateService.createOrUpdateCandidateProfile(
      req.user.userId,
      profileData
    );

    res.status(201).json({
      message: "Candidate profile created or updated",
      data: profile,
    });
  } catch (err) {
    console.error("Error in createOrUpdateProfile:", err); // Add logging for debugging
    res.status(400).json({ message: err.message || "An error occurred during profile update." });
  }
};
