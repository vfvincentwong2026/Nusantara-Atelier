SELECT (SELECT COUNT(*) FROM quotes) AS quotes, (SELECT COUNT(*) FROM bookings) AS bookings, (SELECT COUNT(*) FROM cases) AS cases;
