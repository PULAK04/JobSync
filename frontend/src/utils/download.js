import api from "./api.js";

const getFileNameFromDisposition = (value) => {
    if (!value) return "";

    const encodedMatch = value.match(
        /filename\*=UTF-8''([^;]+)/i
    );

    if (encodedMatch?.[1]) {
        try {
            return decodeURIComponent(
                encodedMatch[1]
            );
        } catch {
            return encodedMatch[1];
        }
    }

    const normalMatch = value.match(
        /filename="?([^";]+)"?/i
    );

    return normalMatch?.[1] || "";
};

const getDownloadErrorMessage = async (error) => {
    const responseData = error?.response?.data;

    if (responseData instanceof Blob) {
        try {
            const text = await responseData.text();
            const parsed = JSON.parse(text);

            return parsed?.message || "";
        } catch {
            return "";
        }
    }

    return (
        responseData?.message ||
        error?.message ||
        ""
    );
};

export const downloadFileFromApi = async (
    url,
    fallbackName = "download.pdf"
) => {
    let response;

    try {
        response = await api.get(url, {
            responseType: "blob"
        });
    } catch (error) {
        const message =
            await getDownloadErrorMessage(error);

        const downloadError = new Error(
            message || "Unable to download file"
        );

        downloadError.status =
            error?.response?.status;

        throw downloadError;
    }

    const fileName =
        getFileNameFromDisposition(
            response.headers["content-disposition"]
        ) || fallbackName;

    const objectUrl = URL.createObjectURL(
        response.data
    );

    const anchor = document.createElement("a");

    anchor.href = objectUrl;
    anchor.download = fileName;
    anchor.style.display = "none";

    document.body.appendChild(anchor);

    anchor.click();
    anchor.remove();

    window.setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
    }, 1000);
};