import { Resend } from "resend";

let client;

const getClient = () => {
    if (!process.env.RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY is not configured");
    }
    client ??= new Resend(process.env.RESEND_API_KEY);
    return client;
};

export const sendEmail = async ({ to, subject, text, html }) => {
    const { data, error } = await getClient().emails.send({
        from: process.env.RESEND_FROM || "JobSync <onboarding@resend.dev>",
        to,
        subject,
        text,
        html
    });

    if (error) throw new Error(error.message || "Email delivery failed");
    return data;
};
