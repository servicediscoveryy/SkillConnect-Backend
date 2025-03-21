import redisClient from "../../database/redisClient";

// Function to generate a random 6-digit OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const storeOTP = async (email: string) => {
  const otp = generateOTP();
  await redisClient.setEx(`otp:${email}`, 300, otp); // Store OTP with 5 min expiry
  return otp;
};

const verifyOTP = async (email: string, userOTP: string) => {
  const storedOTP = await redisClient.get(`otp:${email}`);

  if (storedOTP && storedOTP === userOTP) {
    await redisClient.del(`otp:${email}`); // Remove OTP after successful verification
    return true;
  }
  return false;
};

export { storeOTP, verifyOTP };
