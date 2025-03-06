import Payment from "../../models/paymentModel";


// @ts-ignore
export const processPayment = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const { bookingId, paymentId, amount } = req.body;

        // @ts-ignore
        const payment = new Payment({
            paymentId,
            bookingId,
            amount,
            status: 'captured'
        });

        const savedPayment = await payment.save();
        // @ts-ignore
        res.status(201).json({ message: "Payment processed", data: savedPayment, success: true, error: false });
    } catch (error: any) {
        // @ts-ignore
        res.status(500).json({ message: error.message, error: true, success: false });
    }
};
