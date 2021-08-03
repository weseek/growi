const getTzOffsetHour = (): number => {
  return -(process.env.TIME_ZONE_OFFSET || 9);
};

export { getTzOffsetHour };
