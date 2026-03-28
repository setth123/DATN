export const LEVEL_MAP = {
  "Cơ bản": 1,
  "Trung bình": 2,
  "Khá": 3,
  "Thành thạo": 4,
  "Chuyên gia": 5
};

const calcSkillMatch = (jobSkills, candidateSkills) => {
  const processedJobSkills = jobSkills.map(s => s.name.toLowerCase().trim());
  const processedCandidateSkills = candidateSkills.map(s => s.name.toLowerCase().trim());

  const skillLevel=jobSkills.map(s=>s.level);
  const candidateSkillLevel=candidateSkills.map(s=>s.level);
  let matchCount = 0;
  processedJobSkills.forEach((jobSkill, index) => {
    const candidateIndex = processedCandidateSkills.indexOf(jobSkill);
    if (candidateIndex !== -1) {
      // Nếu có skill trùng tên, so sánh level
      if (LEVEL_MAP[candidateSkillLevel[candidateIndex]] >= LEVEL_MAP[skillLevel[index]]) {
        matchCount++;
      }
    }
  });
  return processedJobSkills.length > 0 ? matchCount / processedJobSkills.length : 0;

};

export const matchCandidateToJob = (job, candidate, candidateSkillsOverride = null,previousJobTitle = []) => {
  const skillsToMatch = candidateSkillsOverride && candidateSkillsOverride.length > 0
    ? candidateSkillsOverride
    : candidate.skills;
  const skillScore = calcSkillMatch(
    job.requiredSkills,
    skillsToMatch
  );

  let titleScore = 0;
  const jobTitleLower = job.title?.toLowerCase(); // Use optional chaining for job.title

  if (jobTitleLower) {
    // Filter out null/undefined titles from previousJobTitle before searching
    const validPreviousJobTitles = previousJobTitle.filter(title => title).map(title => title.toLowerCase());

    if (validPreviousJobTitles.some(prevTitle => prevTitle.includes(jobTitleLower)) ||
        candidate.title?.toLowerCase().includes(jobTitleLower)) {
      titleScore = 1;
    }
  }
  return {
    percentage: Math.round((0.7 * skillScore + 0.3 * titleScore) * 100),
    detail: {
      skills: Number(skillScore.toFixed(2)),
      title: Number(titleScore.toFixed(2))
    }
  };
};
