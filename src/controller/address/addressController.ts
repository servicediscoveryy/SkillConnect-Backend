import STATUS from "../../data/statusCodes";
import Address from "../../models/addressModel";
import { RequestWithUser } from "../../types/RequestWithUser";
import asyncHandler from "../../utils/asyncHandler";
import ApiResponse from "../../utils/response/ApiResponse";
import { addressValidationSchema, validateRequest } from "../../validation";

export const createAddress = asyncHandler(async (req: RequestWithUser, res) => {
  const _id = req.user._id;
  const { street, area, city, state, country, pincode, landmark } = req.body;

  validateRequest(addressValidationSchema, req.body);

  const address = new Address({
    userId: _id,
    street,
    area,
    city,
    state,
    country,
    pincode,
    landmark,
  });

  await address.save();

  res
    .status(STATUS.created)
    .json(new ApiResponse(STATUS.ok, address, "saved address succssfully"));
});

export const getAllAddresses = asyncHandler(
  async (req: RequestWithUser, res) => {
    const userId = req.user._id;
    const addresses = await Address.find({ userId });

    res
      .status(STATUS.ok)
      .json(
        new ApiResponse(STATUS.ok, addresses, "Fetched addresses successfully")
      );
  }
);

export const getAddressById = asyncHandler(
  async (req: RequestWithUser, res) => {
    const { addressId } = req.params;
    const userId = req.user._id;

    const address = await Address.findOne({ _id: addressId, userId });

    if (!address) {
      res
        .status(STATUS.notFound)
        .json(new ApiResponse(STATUS.notFound, null, "Address not found"));
      return;
    }

    res
      .status(STATUS.ok)
      .json(
        new ApiResponse(STATUS.ok, address, "Fetched address successfully")
      );
  }
);

export const updateAddress = asyncHandler(async (req: RequestWithUser, res) => {
  const { addressId } = req.params;
  const userId = req.user._id;

  const updatedAddress = await Address.findOneAndUpdate(
    { _id: addressId, userId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!updatedAddress) {
    res
      .status(STATUS.notFound)
      .json(new ApiResponse(STATUS.notFound, null, "Address not found"));
    return;
  }

  res
    .status(STATUS.ok)
    .json(
      new ApiResponse(STATUS.ok, updatedAddress, "Address updated successfully")
    );
});

export const deleteAddress = asyncHandler(async (req: RequestWithUser, res) => {
  const { addressId } = req.params;
  const userId = req.user._id;

  const address = await Address.findOneAndDelete({ _id: addressId, userId });

  if (!address) {
    res
      .status(STATUS.notFound)
      .json(new ApiResponse(STATUS.notFound, null, "Address not found"));
    return;
  }

  res
    .status(STATUS.ok)
    .json(new ApiResponse(STATUS.ok, null, "Address deleted successfully"));
});
