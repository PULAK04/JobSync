import axios from "axios";

const MAX_RESUME_BYTES = 12 * 1024 * 1024;

const safeFileName = (value = "resume.pdf") => {
    const cleaned = String(value)
        .replace(/[\r\n]/g, "")
        .replace(/[^a-zA-Z0-9._ -]/g, "_")
        .trim();

    const name = cleaned || "resume.pdf";

    return name.toLowerCase().endsWith(".pdf")
        ? name
        : `${name}.pdf`;
};

const assertAllowedResumeUrl = (rawUrl) => {
    let parsed;

    try {
        parsed = new URL(rawUrl);
    } catch {
        const error = new Error(
            "Stored resume URL is invalid"
        );

        error.statusCode = 400;
        error.code = "INVALID_RESUME_URL";

        throw error;
    }

    const allowedHost =
        parsed.hostname === "res.cloudinary.com" ||
        parsed.hostname.endsWith(".cloudinary.com");

    if (
        parsed.protocol !== "https:" ||
        !allowedHost
    ) {
        const error = new Error(
            "Resume download source is not allowed"
        );

        error.statusCode = 400;
        error.code = "RESUME_SOURCE_NOT_ALLOWED";

        throw error;
    }

    return parsed.toString();
};

const normalizeCloudinaryDownloadError = (error) => {
    const status = Number(
        error?.response?.status ||
        error?.status ||
        error?.statusCode
    );

    if (status === 401 || status === 403) {
        const mappedError = new Error(
            "Cloudinary blocked PDF delivery. Enable PDF delivery in Cloudinary settings, then try again."
        );

        mappedError.statusCode = 502;
        mappedError.code = "CLOUDINARY_PDF_DELIVERY_BLOCKED";

        return mappedError;
    }

    if (status === 404) {
        const mappedError = new Error(
            "The stored resume no longer exists in Cloudinary. Please upload it again."
        );

        mappedError.statusCode = 404;
        mappedError.code = "RESUME_FILE_NOT_FOUND";

        return mappedError;
    }

    if (error?.code === "ECONNABORTED") {
        const mappedError = new Error(
            "Cloudinary took too long to return the resume. Please try again."
        );

        mappedError.statusCode = 504;
        mappedError.code = "RESUME_DOWNLOAD_TIMEOUT";

        return mappedError;
    }

    const mappedError = new Error(
        "Unable to fetch the stored resume from Cloudinary"
    );

    mappedError.statusCode = 502;
    mappedError.code = "RESUME_DOWNLOAD_FAILED";

    return mappedError;
};

export const fetchResumeFile = async (resumeUrl) => {
    const url = assertAllowedResumeUrl(resumeUrl);

    let response;

    try {
        response = await axios.get(url, {
            responseType: "arraybuffer",
            timeout: 15000,
            maxContentLength: MAX_RESUME_BYTES,
            maxBodyLength: MAX_RESUME_BYTES,
            validateStatus: (status) =>
                status >= 200 && status < 300
        });
    } catch (error) {
        throw normalizeCloudinaryDownloadError(error);
    }

    const contentType = String(
        response.headers["content-type"] ||
        "application/pdf"
    ).toLowerCase();

    if (
        !contentType.includes("pdf") &&
        !contentType.includes("octet-stream")
    ) {
        const error = new Error(
            "The stored resume is not a PDF file"
        );

        error.statusCode = 415;
        error.code = "RESUME_NOT_PDF";

        throw error;
    }

    return {
        buffer: Buffer.from(response.data),
        contentType: contentType.includes("pdf")
            ? contentType
            : "application/pdf"
    };
};

export const sendResumeDownload = async (
    res,
    { resumeUrl, fileName }
) => {
    const { buffer, contentType } =
        await fetchResumeFile(resumeUrl);

    const safeName = safeFileName(fileName);
    const encodedName = encodeURIComponent(safeName);

    res.set({
        "Content-Type": contentType,
        "Content-Disposition":
            `attachment; filename="${safeName}"; ` +
            `filename*=UTF-8''${encodedName}`,
        "Content-Length": buffer.length,
        "Cache-Control": "private, max-age=300"
    });

    return res.end(buffer);
};