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
