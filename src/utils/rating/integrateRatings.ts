import Rating from "../../models/ratingModel";

export const integrateRatings = async (services: any) => {
  if (!services.length) return [];

  const serviceIds = services.map((service: any) => service._id);

  // Fetch ratings using MongoDB aggregation
  const ratingsData = await Rating.aggregate([
    {
      $match: { serviceId: { $in: serviceIds } },
    },
    {
      $group: {
        _id: "$serviceId",
        avgRating: { $avg: "$rating" },
        ratingCount: { $sum: 1 },
      },
    },
  ]);

  // Convert rating data into an object for quick lookup
  const ratingsMap = ratingsData.reduce((acc, rating) => {
    acc[rating._id.toString()] = {
      avgRating: parseFloat(rating.avgRating.toFixed(1)) || 0, // ✅ Default to 0
      ratingCount: rating.ratingCount || 0,
    };
    return acc;
  }, {});

  // Merge ratings with services
  return services.map((service: any) => {
    const rating = ratingsMap[service._id.toString()] || {
      avgRating: 0,
      ratingCount: 0,
    };
    return {
      ...service.toObject(),
      avgRating: rating.avgRating,
      ratingCount: rating.ratingCount,
    };
  });
};
