export const sanitizeUser = (user) => {
    const value = user?.toObject ? user.toObject() : { ...user };
    delete value.password;
    delete value.creditedPaymentIds;
    return value;
};
