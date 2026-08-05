import axios from "axios";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const MAX_PDF_BYTES = 8 * 1024 * 1024;
const MAX_RESUME_CHARACTERS = 30000;

const assertSafeResumeUrl = (resumeUrl) => {
    let parsed;

    try {
        parsed = new URL(resumeUrl);
    } catch {
        const error = new Error("Stored resume URL is invalid");
        error.statusCode = 400;
        error.code = "INVALID_RESUME_URL";
        throw error;
    }

    const allowedHosts = (
        process.env.RESUME_ALLOWED_HOSTS ||
        "res.cloudinary.com"
    )
        .split(",")
        .map((host) => host.trim().toLowerCase())
        .filter(Boolean);

    const resumeHost = parsed.hostname.toLowerCase();

    const hostAllowed = allowedHosts.some(
        (host) =>
            resumeHost === host ||
            resumeHost.endsWith(`.${host}`)
    );

    if (parsed.protocol !== "https:" || !hostAllowed) {
        const error = new Error(
            "Resume URL must be an approved HTTPS Cloudinary URL"
        );

        error.statusCode = 400;
        error.code = "RESUME_SOURCE_NOT_ALLOWED";

        throw error;
    }
};

const normalizeCloudinaryError = (error) => {
    const status = Number(
        error?.response?.status ||
        error?.status ||
        error?.statusCode
    );

    if (status === 401 || status === 403) {
        const mappedError = new Error(
            "Cloudinary blocked PDF delivery. Enable PDF delivery in Cloudinary settings, then retry AI Match."
        );

        mappedError.statusCode = 502;
        mappedError.code = "CLOUDINARY_PDF_DELIVERY_BLOCKED";

        return mappedError;
    }

    if (status === 404) {
        const mappedError = new Error(
            "The stored resume no longer exists in Cloudinary. Upload it again from Profile."
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
        "Unable to read the stored resume from Cloudinary"
    );

    mappedError.statusCode = 502;
    mappedError.code = "RESUME_DOWNLOAD_FAILED";

    return mappedError;
};

export const extractPdfTextFromUrl = async (resumeUrl) => {
    assertSafeResumeUrl(resumeUrl);

    let response;

    try {
        response = await axios.get(resumeUrl, {
            responseType: "arraybuffer",
            timeout: 15000,
            maxContentLength: MAX_PDF_BYTES,
            maxBodyLength: MAX_PDF_BYTES,
            validateStatus: (status) =>
                status >= 200 && status < 300
        });
    } catch (error) {
        throw normalizeCloudinaryError(error);
    }

    const contentType = String(
        response.headers["content-type"] || ""
    ).toLowerCase();

    if (
        contentType &&
        !contentType.includes("pdf") &&
        !contentType.includes("octet-stream")
    ) {
        const error = new Error(
            "Uploaded resume must be a PDF file"
        );

        error.statusCode = 400;
        error.code = "RESUME_NOT_PDF";

        throw error;
    }

    const buffer = Buffer.from(response.data);

    if (buffer.length > MAX_PDF_BYTES) {
        const error = new Error("Resume PDF is too large");

        error.statusCode = 400;
        error.code = "RESUME_TOO_LARGE";

        throw error;
    }

    const pdf = await getDocument({
        data: new Uint8Array(buffer)
    }).promise;

    const pages = [];
    let characterCount = 0;

    for (
        let pageNumber = 1;
        pageNumber <= pdf.numPages;
        pageNumber += 1
    ) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();

        const pageText = content.items
            .map((item) => item.str)
            .join(" ");

        pages.push(pageText);

        characterCount += pageText.length;

        if (characterCount >= MAX_RESUME_CHARACTERS) {
            break;
        }
    }

    const text = pages
        .join("\n")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, MAX_RESUME_CHARACTERS);

    if (!text) {
        const error = new Error(
            "Unable to extract readable text from the resume PDF"
        );

        error.statusCode = 400;
        error.code = "RESUME_TEXT_EMPTY";

        throw error;
    }

    return text;
};