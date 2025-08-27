import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

const app = express();
const PORT = 9001;

// Replace with your GA4 Property ID
const propertyId = "501552511";

// Initialize GA Data API client
const analyticsDataClient = new BetaAnalyticsDataClient({
    keyFilename: "woven-framework-439808-q0-5a8a1e778933.json", // service account JSON
});

// ----------------- Swagger Setup -----------------
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Google Analytics Dashboard API",
            version: "1.0.0",
            description: "API for fetching GA4 analytics data",
        },
        servers: [{ url: `http://localhost:${PORT}` }],
    },
    apis: ["./app.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ----------------- Routes -----------------

/**
 * @swagger
 * /analytics/events:
 *   get:
 *     summary: Get user events and click counts
 *     responses:
 *       200:
 *         description: List of events with counts
 */
app.get("/analytics/events", async (req, res) => {
    try {
        const [response] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: "2024-08-01", endDate: "today" }],
            dimensions: [{ name: "eventName" }],
            metrics: [{ name: "eventCount" }],
        });

        const data = response.rows?.map((row) => ({
            event: row.dimensionValues?.[0]?.value || "N/A",
            count: row.metricValues?.[0]?.value || "0",
        }));
        res.json({ data });
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ error: "Failed to fetch event data" });
    }
});

/**
 * @swagger
 * /analytics/clicks-per-page:
 *   get:
 *     summary: Get click counts per page
 *     responses:
 *       200:
 *         description: List of pages with click counts
 */
app.get("/analytics/clicks-per-page", async (req, res) => {
    try {
        const [response] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            // dateRanges: [{ startDate: "2024-08-01", endDate: "today" }],
            dimensions: [
                { name: "pagePath" },   // URL path of the page
                { name: "eventName" }   // Event type (click, etc.)
            ],
            metrics: [{ name: "eventCount" }],
            dimensionFilter: {
                filter: {
                    fieldName: "eventName",
                    stringFilter: { value: "click" }, // Only click events
                },
            },
        });

        const data = response.rows?.map((row) => ({
            page: row.dimensionValues?.[0]?.value || "N/A",
            event: row.dimensionValues?.[1]?.value || "click",
            count: row.metricValues?.[0]?.value || "0",
        }));

        res.json({ data });
    } catch (error) {
        console.error("Error fetching click events per page:", error);
        res.status(500).json({ error: "Failed to fetch click event data" });
    }
});


/**
 * @swagger
 * /analytics/session-duration:
 *   get:
 *     summary: Get average session duration
 *     responses:
 *       200:
 *         description: Average time spent in sessions
 */
app.get("/analytics/session-duration", async (req, res) => {
    try {
        const [response] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: "2024-08-01", endDate: "today" }],
            metrics: [{ name: "averageSessionDuration" }],
        });

        const avgDuration =
            response.rows?.[0]?.metricValues?.[0]?.value || "0";

        res.json({ averageSessionDuration: avgDuration });
    } catch (error) {
        console.error("Error fetching session duration:", error);
        res.status(500).json({ error: "Failed to fetch session duration" });
    }
});

/**
 * @swagger
 * /analytics/engaged-sessions:
 *   get:
 *     summary: Get engaged sessions count
 *     responses:
 *       200:
 *         description: Engaged sessions (sessions longer than 10s or with conversion)
 */
app.get("/analytics/engaged-sessions", async (req, res) => {
    try {
        const [response] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: "2024-08-01", endDate: "today" }],
            metrics: [{ name: "engagedSessions" }],
        });

        const engagedSessions =
            response.rows?.[0]?.metricValues?.[0]?.value || "0";

        res.json({ engagedSessions });
    } catch (error) {
        console.error("Error fetching engaged sessions:", error);
        res.status(500).json({ error: "Failed to fetch engaged sessions" });
    }
});

/**
 * @swagger
 * /analytics/bounce-rate:
 *   get:
 *     summary: Get bounce rate
 *     responses:
 *       200:
 *         description: Bounce rate percentage
 */
app.get("/analytics/bounce-rate", async (req, res) => {
    try {
        const [response] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: "2024-08-01", endDate: "today" }],
            metrics: [{ name: "bounceRate" }],
        });

        const bounceRate = response.rows?.[0]?.metricValues?.[0]?.value || "0";

        res.json({ bounceRate });
    } catch (error) {
        console.error("Error fetching bounce rate:", error);
        res.status(500).json({ error: "Failed to fetch bounce rate" });
    }
});

/**
 * @swagger
 * /analytics/views-per-session:
 *   get:
 *     summary: Get average screen/page views per session
 *     responses:
 *       200:
 *         description: Screen views per session
 */
app.get("/analytics/views-per-session", async (req, res) => {
    try {
        const [response] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: "2024-08-01", endDate: "today" }],
            metrics: [{ name: "screenPageViewsPerSession" }],
        });

        const viewsPerSession =
            response.rows?.[0]?.metricValues?.[0]?.value || "0";

        res.json({ viewsPerSession });
    } catch (error) {
        console.error("Error fetching views per session:", error);
        res.status(500).json({ error: "Failed to fetch views per session" });
    }
});


/**
 * @swagger
 * /analytics/users-by-city:
 *   get:
 *     summary: Get active users grouped by city
 *     responses:
 *       200:
 *         description: List of active users per city
 */
app.get("/analytics/users-by-city", async (req, res) => {
    try {
        const [response] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: "2024-08-01", endDate: "today" }],
            dimensions: [{ name: "city" }],
            metrics: [{ name: "activeUsers" }],
        });

        const data = response.rows?.map((row) => ({
            city: row.dimensionValues[0].value,
            activeUsers: row.metricValues[0].value,
        }));

        res.json({ data });
    } catch (error) {
        console.error("Error fetching GA data:", error);
        res.status(500).json({ error: "Failed to fetch GA data" });
    }
});

/**
 * @swagger
 * /analytics/page-views:
 *   get:
 *     summary: Get page views by path
 *     responses:
 *       200:
 *         description: List of page views per page path
 */
app.get("/analytics/page-views", async (req, res) => {
    try {
        const [response] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: "2024-08-01", endDate: "today" }],
            dimensions: [{ name: "pagePath" }],
            metrics: [{ name: "screenPageViews" }],
        });

        const data = response.rows?.map((row) => ({
            pagePath: row.dimensionValues[0].value,
            pageViews: row.metricValues[0].value,
        }));

        res.json({ data });
    } catch (error) {
        console.error("Error fetching GA data:", error);
        res.status(500).json({ error: "Failed to fetch GA data" });
    }
});

/**
 * @swagger
 * /analytics/users-by-country:
 *   get:
 *     summary: Get active users grouped by country
 *     responses:
 *       200:
 *         description: List of active users per country
 */
app.get("/analytics/users-by-country", async (req, res) => {
    try {
        const [response] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: "2024-08-01", endDate: "today" }],
            dimensions: [{ name: "country" }],
            metrics: [{ name: "activeUsers" }],
        });

        const data = response.rows?.map((row) => ({
            country: row.dimensionValues[0].value,
            activeUsers: row.metricValues[0].value,
        }));

        res.json({ data });
    } catch (error) {
        console.error("Error fetching GA data:", error);
        res.status(500).json({ error: "Failed to fetch GA data" });
    }
});

/**
 * @swagger
 * /analytics/new-vs-returning:
 *   get:
 *     summary: Get new vs returning users
 *     responses:
 *       200:
 *         description: Breakdown of users by new vs returning
 */
app.get("/analytics/new-vs-returning", async (req, res) => {
    try {
        const [response] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: "2024-08-01", endDate: "today" }],
            dimensions: [{ name: "newVsReturning" }],
            metrics: [{ name: "activeUsers" }],
        });

        const data = response.rows?.map((row) => ({
            type: row.dimensionValues[0].value,
            users: row.metricValues[0].value,
        }));

        res.json({ data });
    } catch (error) {
        console.error("Error fetching GA data:", error);
        res.status(500).json({ error: "Failed to fetch GA data" });
    }
});

/**
 * @swagger
 * /analytics/top-browsers:
 *   get:
 *     summary: Get top browsers used by users
 *     responses:
 *       200:
 *         description: List of browsers and user counts
 */
app.get("/analytics/top-browsers", async (req, res) => {
    try {
        const [response] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: "2024-08-01", endDate: "today" }],
            dimensions: [{ name: "browser" }],
            metrics: [{ name: "activeUsers" }],
        });

        const data = response.rows?.map((row) => ({
            browser: row.dimensionValues[0].value,
            users: row.metricValues[0].value,
        }));

        res.json({ data });
    } catch (error) {
        console.error("Error fetching GA data:", error);
        res.status(500).json({ error: "Failed to fetch GA data" });
    }
});

/**
 * @swagger
 * /analytics/device-category:
 *   get:
 *     summary: Get users by device category
 *     responses:
 *       200:
 *         description: Breakdown of users by device category (desktop/mobile/tablet)
 */
app.get("/analytics/device-category", async (req, res) => {
    try {
        const [response] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: "2024-08-01", endDate: "today" }],
            dimensions: [{ name: "deviceCategory" }],
            metrics: [{ name: "activeUsers" }],
        });

        const data = response.rows?.map((row) => ({
            device: row.dimensionValues[0].value,
            users: row.metricValues[0].value,
        }));

        res.json({ data });
    } catch (error) {
        console.error("Error fetching GA data:", error);
        res.status(500).json({ error: "Failed to fetch GA data" });
    }
});

/**
 * @swagger
 * /analytics/traffic-sources:
 *   get:
 *     summary: Get traffic sources (session source/medium)
 *     responses:
 *       200:
 *         description: List of traffic sources
 */
app.get("/analytics/traffic-sources", async (req, res) => {
    try {
        const [response] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: "2024-08-01", endDate: "today" }],
            dimensions: [{ name: "sessionSourceMedium" }],
            metrics: [{ name: "sessions" }],
        });

        const data = response.rows?.map((row) => ({
            sourceMedium: row.dimensionValues[0].value,
            sessions: row.metricValues[0].value,
        }));

        res.json({ data });
    } catch (error) {
        console.error("Error fetching GA data:", error);
        res.status(500).json({ error: "Failed to fetch GA data" });
    }
});

// ----------------- Start Server -----------------
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📖 Swagger docs available at http://localhost:${PORT}/api-docs`);
});
