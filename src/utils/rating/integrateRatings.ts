// ratingUtils.js

import Rating from "../../models/ratingModel";

export const integrateRatings = async (services: any) => {
  const serviceIds = services.map((service: any) => service._id);

  // Fetch ratings data for the given serviceIds
  const topServices = await Rating.aggregate([
    {
      $match: {
        serviceId: { $in: serviceIds },
      },
    },
    {
      $group: {
        _id: "$serviceId",
        avgRating: { $avg: "$rating" },
        ratingCount: { $sum: 1 },
      },
    },
  ]);

  // Merge the ratings data with the services
  return services.map((service: any) => {
    const topService = topServices.find(
      (topService) => topService._id.toString() === service._id.toString()
    );
    return {
      ...service.toObject(),
      avgRating: topService ? topService.avgRating : null,
      ratingCount: topService ? topService.ratingCount : 0,
    };
  });
};
