import axios from "axios";
import { Request, Response } from "express";
import Service from "../../models/serviceModel"; // Assuming this is your service model
import userRecommonded from "../../models/userRecommend";

export const getRecommendedServices = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user._id;

        // Fetch recommendations based on your logistic regression model
        const recommendedServiceIds = await userRecommonded.findOne({ userId });
        // @ts-ignore
        const recommendedServices = await Service.find({ _id: { $in: recommendedServiceIds.serviceIds } });

        // @ts-ignore
        res.status(200).json({ data: recommendedServices, success: true, error: false, message: "Recommended services fetched" });
    } catch (error: any) {
        // @ts-ignore
        res.status(500).json({ message: error.message, error: true, success: false });
    }
};


export const getRecommendedByUser = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user._id;

        // Call external recommendation system
        const response = await axios.get(`https://recommondedsys.onrender.com/recommend/${userId}`);

        const recommendedServiceIds: string[] = response.data?.serviceIds;

        if (!recommendedServiceIds || recommendedServiceIds.length === 0) {
            return res.status(200).json({
                data: [],
                success: true,
                error: false,
                message: "No recommendations found for this user."
            });
        }

        // Fetch services from your database
        const recommendedServices = await Service.find({ _id: { $in: recommendedServiceIds } });

        res.status(200).json({
            data: recommendedServices,
            success: true,
            error: false,
            message: "Recommended services fetched successfully."
        });

    } catch (error: any) {
        console.error("Error fetching recommendations:", error.message);

        res.status(500).json({
            message: error.message || "Server error",
            error: true,
            success: false
        });
    }
};


