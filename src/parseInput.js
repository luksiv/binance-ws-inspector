

export default function parseInput(input) {
  const obj = JSON.parse(input);
  return {
      "eventType": obj["e"],
      "eventTime": obj["E"],
      "symbol": obj["s"],
      "klineData": {
          "klineStartTime": obj["k"]["t"],
          "klineCloseTime": obj["k"]["T"],
          "symbol": obj["k"]["s"],
          "interval": obj["k"]["i"],
          "firstTradeId": obj["k"]["f"],
          "lastTradeId": obj["k"]["L"],
          "openPrice": obj["k"]["o"],
          "closePrice": obj["k"]["c"],
          "highPrice": obj["k"]["h"],
          "lowPrice": obj["k"]["l"],
          "baseAssetVolume": obj["k"]["v"],
          "numberOfTrades": obj["k"]["n"],
          "isThisKlineClosed": obj["k"]["x"],
          "quoteAssetVolume": obj["k"]["q"],
          "takerBuyBaseAssetVolume": obj["k"]["V"],
          "takerBuyQuoteAssetVolume": obj["k"]["Q"],
          "ignore": obj["k"]["B"],
      }
  }}