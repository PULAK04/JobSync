import DataUriParser from "datauri/parser.js";
import path from "path";

export const getDataUri = (file) => {
    if (!file?.buffer || !file?.originalname) return null;
    const parser = new DataUriParser();
    return parser.format(path.extname(file.originalname), file.buffer);
};
