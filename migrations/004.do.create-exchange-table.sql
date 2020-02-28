CREATE TABLE exchange_day_datas (
    token_id INTEGER REFERENCES tokens(id) ON DELETE CASCADE NOT NULL,
    timestamp INTEGER REFERENCES timestamps(timestamp) ON DELETE CASCADE NOT NULL,
    eth_price NUMERIC NOT NULL,
    volume NUMERIC NOT NULL,
    liquidity NUMERIC NOT NULL,
    PRIMARY KEY (token_id, timestamp)
);
