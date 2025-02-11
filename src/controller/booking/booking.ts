import Booking from "../../models/bookingModel";



export const bookService = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const { serviceId, amount } = req.body;
        // @ts-ignore
        const userId = req.user._id;

        // @ts-ignore
        const newBooking = new Booking({
            userId,
            serviceId,
            amount,
            status: 'pending',
            orderId: `ORD-${Date.now()}`
        });

        const savedBooking = await newBooking.save();
        // @ts-ignore
        res.status(201).json({ message: "Service booked", data: savedBooking, success: true, error: false });
    } catch (error: any) {
        // @ts-ignore
        res.status(500).json({ message: error.message, error: true, success: false });
    }
};


export const getUserBookings = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const bookings = await Booking.find({ userId: req.user._id }).populate('serviceId');
        // @ts-ignore
        res.status(200).json({ data: bookings, success: true, error: false });
    } catch (error: any) {
        // @ts-ignore
        res.status(500).json({ message: error.message, error: true, success: false });
    }
};
