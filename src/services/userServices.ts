import STATUS from "../data/statusCodes";
import Booking from "../models/bookingModel";
import Service from "../models/serviceModel";
import User from "../models/userModel";
import ApiError from "../utils/response/ApiError";
// export const getUsersWhoBookedProviderServices = async (providerId: string, page: number, limit: number) => {
//     if (!providerId) throw new ApiError(STATUS.unauthorized, "Unauthorized");
  
//     // Get provider's services
//     const providerServices = await Service.find({ providerId }).select("_id");
//     if (providerServices.length === 0) return { users: [], totalUsers: 0 };
  
//     // Extract service IDs
//     const serviceIds = providerServices.map((service) => service._id);
  
//     // Find distinct users who booked the provider's services
//     const userIds = await Booking.distinct("userId", { serviceId: { $in: serviceIds } });
  
//     // Paginate users
//     const users = await User.find({ _id: { $in: userIds } })
//       .select("_id name email profilePicture")
//       .skip((page - 1) * limit)
//       .limit(limit);
  
//     // Total users count
//     const totalUsers = userIds.length;
  
//     return { users, totalUsers };
//   };


export const getUsersWhoBookedProviderServices = async (
    providerId: string,
    page: number,
    limit: number
  ) => {
    if (!providerId) throw new ApiError(STATUS.unauthorized, "Unauthorized");
  
    // Get provider's services
    const providerServices = await Service.find({ providerId }).select("_id");
    if (providerServices.length === 0) return { users: [], totalUsers: 0 };
  
    // Extract service IDs
    const serviceIds = providerServices.map((service) => service._id);
  
    // Find users who booked the provider's services and populate the service details
    const bookings = await Booking.find({ serviceId: { $in: serviceIds } })
      .populate("userId", "_id firstName lastName email profilePicture") // Populate user details
      .populate("serviceId", "_id title category price createdAt") // Populate service details
      .sort({ createdAt: -1 }) // Sort by latest bookings
      .skip((page - 1) * limit)
      .limit(limit);
  
    // Format the response
    const users = bookings.map((booking) => ({
      user: {
        _id: (booking.userId as any)._id,
        firstName: (booking.userId as any).firstName,
        lastName: (booking.userId as any).lastName,
        email: (booking.userId as any).email,
        profilePicture: (booking.userId as any).profilePicture,
      },
      service: {
        _id: (booking.serviceId as any)._id,
        title: (booking.serviceId as any).title,
        category: (booking.serviceId as any).category,
        price: (booking.serviceId as any).price,
        date:(booking.serviceId as any).createdAt,
        status:(booking.orderStatus)
      },
    }));
  
    // Get the total count of distinct users
    const totalUsers = await Booking.distinct("userId", { serviceId: { $in: serviceIds } }).countDocuments();
  
    return { users, totalUsers };
  };
  