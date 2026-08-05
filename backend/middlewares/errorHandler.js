export const notFound = (req, res) => {
    return res.status(404).json({ success: false, message: "Route not found" });
};

export const errorHandler = (error, req, res, next) => {
    if (res.headersSent) return next(error);

    console.error(error);

    if (error?.code === 11000) {
        return res.status(409).json({
            success: false,
            message: "A record with the same unique value already exists"
        });
    }

    if (error?.name === "MulterError") {
        return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(error.statusCode || 500).json({
        success: false,
        code: error.code || undefined,
        message: error.message || "Internal server error"
    });
};
