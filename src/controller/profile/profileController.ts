import User from "../../models/userModel";

export const getProfileController = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const user = req.user._id;
        const profile = await User.findOne({ _id: user }).select("-password");

        if (profile) {
            // @ts-ignore
            res.status(200).json({
                message: "Profile fetched successfully",
                data: profile,
                success: true,
                error: false
            })
        }
    } catch (error: any) {
        // @ts-ignore
        res.status(500).json({
            message: error.message,
            error: true,
            success: false
        })
    }
}


export const updateUserProfile = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const { firstName, lastName, phone, profilePicture } = req.body;
        // @ts-ignore
        const userId = req.user._id;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { firstName, lastName, phone, profilePicture },
            { new: true }
        );

        if (!updatedUser) {
            // @ts-ignore
            return res.status(404).json({ message: "User not found", error: true, success: false });
        }

        // @ts-ignore
        res.status(200).json({ message: "Profile updated", data: updatedUser, success: true, error: false });
    } catch (error: any) {
        // @ts-ignore
        res.status(500).json({ message: error.message, error: true, success: false });
    }
};

