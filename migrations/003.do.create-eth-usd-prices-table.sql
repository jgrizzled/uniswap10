CREATE TABLE eth_usd_prices (
    timestamp INTEGER REFERENCES timestamps(timestamp) ON DELETE CASCADE NOT NULL PRIMARY KEY,
    price NUMERIC NOT NULL
);