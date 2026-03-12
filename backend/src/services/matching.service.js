export const LEVEL_MAP = {
  "cơ bản": 1,
  "thành thạo": 2,
  "chuyên sâu": 3,
  "senior": 4,
  "expert": 5
};

const calcSkillMatch = (jobSkills, candidateSkills) => {
  const match = jobSkills.filter(s =>
    candidateSkills.includes(s)
  );
  return match.length / jobSkills.length;
};

export const matchCandidateToJob = (job, candidate) => {
  const skillScore = calcSkillMatch(
    job.requiredSkills,
    candidate.skills
  );

  const levelScore =
    LEVEL_MAP[candidate.level] >= LEVEL_MAP[job.level] ? 1 : 0;

  const titleScore =
    candidate.title
      ?.toLowerCase()
      .includes(job.title.toLowerCase()) ? 1 : 0;

  const score =
    0.5 * skillScore +
    0.3 * levelScore +
    0.2 * titleScore;

  return {
    percentage: Math.round(score * 100),
    detail: {
      skills: Number(skillScore.toFixed(2)),
      level: levelScore,
      title: Number(titleScore.toFixed(2))
    }
  }
};
