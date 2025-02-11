import Rating from "../../models/ratingModel";
import Service from "../../models/serviceModel";

import { Request, Response } from "express";


export const createService = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const providerId = req.user._id;
        const { title, description, category, image, price, tags } = req.body;;
        // validate body

        const newService = new Service({
            providerId,
            title,
            description,
            category,
            image,
            price,
            status: 'active', // Service is active by default
            tags
        });


        const savedService = await newService.save();
        res.status(201).json({
            message: "Service created successfully",
            data: savedService,
            success: true,
            error: false
        });



    } catch (error: any) {
        res.status(500).json({
            message: error.message,
            error: true,
            success: false
        })

    }
}


export const getServiceById = async (req: Request, res: Response) => {
    try {

        const serviceId = req.params.serviceId;

        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }
        res.status(200).json({ data: service, success: true, error: false, message: "Service fetched successfully" });
    } catch (error: any) {
        res.status(500).json({ error: true, success: false, message: error.message });
    }
};

export const updateService = async (req: Request, res: Response) => {
    try {
        // validate request body
        const { title, description, category, image, price, tags } = req.body;
        const updatedService = await Service.findByIdAndUpdate(
            req.params.serviceId,
            { title, description, category, image, price, tags },
            { new: true } // Return the updated document
        );

        if (!updatedService) {
            return res.status(404).json({ message: "Service not found" });
        }

        res.status(200).json({ message: "Service updated successfully", data: updatedService, success: true, error: false });
    } catch (error: any) {
        res.status(500).json({ error: true, success: false, message: error.message });
    }
};


export const deleteService = async (req: Request, res: Response) => {
    try {
        const serviceId = req.params.serviceId;
        const service = await Service.findByIdAndDelete(serviceId);

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        res.status(200).json({ message: "Service deleted successfully", success: true, error: false });
    } catch (error: any) {
        res.status(500).json({ error: true, success: false, message: error.message });
    }
};

export const getAllServices = async (req: Request, res: Response) => {
    try {
        const services = await Service.find();
        res.status(200).json({ data: services, success: true, error: false, message: "Services fetched successfully" });
    } catch (error: any) {
        res.status(500).json({ error: true, success: false, message: error.message });
    }
};

export const getServicesByCategory = async (req: Request, res: Response) => {
    try {
        const { category } = req.params;
        const services = await Service.find({ category, status: 'active' });
        res.status(200).json({ data: services, success: true, error: false, message: "Services fetched by category" });
    } catch (error: any) {
        res.status(500).json({ message: error.message, error: true, success: false });
    }
};

export const searchServices = async (req: Request, res: Response) => {
    try {
        const { query } = req.query; // Search query
        const services = await Service.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { tags: { $regex: query, $options: 'i' } },
            ],
            status: 'active'
        });
        res.status(200).json({ data: services, success: true, error: false, message: "Search results" });
    } catch (error: any) {
        res.status(500).json({ message: error.message, error: true, success: false });
    }
};


export const rateService = async (req: Request, res: Response) => {
    try {
        const { serviceId } = req.params;
        const { rating, description } = req.body;
        // @ts-ignore
        const userId = req.user._id; // Assuming you attach user info in middleware
        
        // @ts-ignore
        const newRating = new Rating({ userId, serviceId, rating, description });
        await newRating.save();

        res.status(201).json({ message: "Service rated successfully", data: newRating, success: true, error: false });
    } catch (error: any) {
        res.status(500).json({ message: error.message, error: true, success: false });
    }
};


