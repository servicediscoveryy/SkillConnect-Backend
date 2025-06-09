"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bookingModel_js_1 = __importDefault(require("../models/bookingModel.js"));
const serviceModel_js_1 = __importDefault(require("../models/serviceModel.js"));
const node_apriori_1 = require("node-apriori");
(() => __awaiter(void 0, void 0, void 0, function* () {
    const bookingsRaw = yield bookingModel_js_1.default.find({}).sort({ createdAt: 1 });
    const bookings = [];
    for (const booking of bookingsRaw) {
        const service = yield serviceModel_js_1.default.findById(booking.serviceId);
        if (!service || !service.title)
            continue;
        bookings.push({
            userId: booking.userId.toString(),
            serviceTitle: service.title.toLowerCase(),
            createdAt: new Date(booking.createdAt),
        });
    }
    // Group bookings
    const userGroupedTransactions = {};
    const lastBookingTimes = {};
    const TWO_DAYS = 1000 * 60 * 60 * 24 * 2;
    for (const booking of bookings) {
        const { userId, serviceTitle, createdAt } = booking;
        if (!userGroupedTransactions[userId]) {
            userGroupedTransactions[userId] = [[serviceTitle]];
            lastBookingTimes[userId] = [createdAt];
            continue;
        }
        const transactions = userGroupedTransactions[userId];
        const lastTransaction = transactions[transactions.length - 1];
        const lastTimes = lastBookingTimes[userId];
        const lastTime = lastTimes[lastTimes.length - 1];
        const diff = createdAt.getTime() - lastTime.getTime();
        if (diff <= TWO_DAYS) {
            if (!lastTransaction.includes(serviceTitle)) {
                lastTransaction.push(serviceTitle);
            }
            lastTimes[lastTimes.length - 1] = createdAt;
        }
        else {
            transactions.push([serviceTitle]);
            lastTimes.push(createdAt);
        }
    }
    const allTransactions = Object.values(userGroupedTransactions).flat();
    const uniqueTransactions = allTransactions.map((arr) => [...new Set(arr)]);
    const apriori = new node_apriori_1.Apriori({ minSupport: 0.5, minConfidence: 0.6 });
    const result = yield apriori.exec(uniqueTransactions);
    // Build recommendation dictionary
    const recommendationDict = {};
    for (const rule of result.associationRules) {
        const base = rule.lhs;
        const additions = rule.rhs;
        if (base.length === 1 && additions.length >= 1) {
            const baseKey = base[0];
            if (!recommendationDict[baseKey]) {
                recommendationDict[baseKey] = [];
            }
            recommendationDict[baseKey].push({
                item: additions[0],
                confidence: rule.confidence,
            });
        }
    }
    function getRecommendations(serviceName) {
        const base = serviceName.toLowerCase();
        const recommendations = recommendationDict[base];
        if (!recommendations)
            return [];
        return recommendations
            .sort((a, b) => b.confidence - a.confidence)
            .map((item) => item.item);
    }
    // Example usage
    const input = "cook";
    console.log(`📦 Recommendations for '${input}':`, getRecommendations(input));
    process.exit();
}))();
