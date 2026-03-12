export const buildJobQuery = (query) => {
  const filter = {};

  // Search keyword
  if (query.keyword) {
    filter.$text = { $search: query.keyword };
  }

  // Filter by skills
  if (query.skills) {
    filter.requiredSkills = {
      $in: query.skills.split(",")
    };
  }

  // Level
  if (query.level) {
    filter.level = query.level;
  }

  // Company
  if (query.companyId) {
    filter.companyId = query.companyId;
  }

  // Date range
  if (query.startDate) {
    filter.startDate = { $lte: new Date() };
  }

  // Filter by locations (array of strings)
  if (query.locations && Array.isArray(query.locations) && query.locations.length > 0) {
    filter.$or = query.locations.map((loc) => ({
      location: { 
        $regex: loc.trim(), 
        $options: "i" // không phân biệt hoa thường
      }
    }));
  }

  return filter;
};

export const buildSortQuery = (sort) => {
  switch (sort) {
    case "salary":
      return { createdAt: -1 };
    case "newest":
    default:
      return { createdAt: -1 };
  }
};
